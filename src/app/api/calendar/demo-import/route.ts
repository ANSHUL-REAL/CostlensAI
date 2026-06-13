import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

type DemoEvent = {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  organizer?: { email?: string };
  attendees?: Array<{ email?: string; displayName?: string }>;
  recurringEventId?: string | null;
};

export async function POST() {
  await requireSession();

  const service = createServiceRoleClient();
  const demoPath = path.join(process.cwd(), "data", "demo-calendar.json");
  const contents = await readFile(demoPath, "utf8");
  const events = JSON.parse(contents) as DemoEvent[];

  const { data: employees, error: employeesError } = await service
    .from("employees")
    .select("id, email, hourly_rate, name");

  if (employeesError) {
    throw new Error(employeesError.message);
  }

  const employeeByEmail = new Map(
    (employees ?? []).map((employee) => [
      employee.email,
      {
        id: employee.id as string,
        rate: Number(employee.hourly_rate ?? 0),
        name: employee.name as string,
      },
    ]),
  );

  let importedMeetings = 0;
  let importedAttendees = 0;

  for (const event of events) {
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const durationMinutes = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
    );

    const attendees = (event.attendees ?? []).filter(
      (attendee): attendee is { email: string; displayName?: string } => Boolean(attendee.email),
    );

    const attendeeRows = attendees.map((attendee) => {
      const employee = employeeByEmail.get(attendee.email);
      const rate = employee?.rate ?? 0;
      const contribution = Math.round((rate * durationMinutes) / 60);
      return {
        employee_id: employee?.id ?? null,
        email: attendee.email,
        hourly_rate_snapshot: rate,
        cost_contribution: contribution,
      };
    });

    const totalCost = attendeeRows.reduce(
      (sum, attendee) => sum + Number(attendee.cost_contribution ?? 0),
      0,
    );

    const { data: upsertedMeeting, error: meetingError } = await service
      .from("meetings")
      .upsert(
        {
          calendar_event_id: event.id,
          title: event.summary,
          description: event.description ?? "",
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          duration_minutes: durationMinutes,
          organizer_email: event.organizer?.email ?? null,
          project_id: null,
          ai_confidence: 0,
          ai_reason: "Awaiting attribution.",
          total_cost: totalCost,
          is_recurring: Boolean(event.recurringEventId),
          needs_review: false,
          status: "imported",
        },
        { onConflict: "calendar_event_id" },
      )
      .select("id")
      .single();

    if (meetingError) {
      throw new Error(meetingError.message);
    }

    const meetingId = upsertedMeeting.id as string;

    const { error: deleteError } = await service
      .from("meeting_attendees")
      .delete()
      .eq("meeting_id", meetingId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (attendeeRows.length > 0) {
      const { error: attendeesError } = await service.from("meeting_attendees").insert(
        attendeeRows.map((attendee) => ({
          meeting_id: meetingId,
          ...attendee,
        })),
      );

      if (attendeesError) {
        throw new Error(attendeesError.message);
      }
    }

    importedMeetings += 1;
    importedAttendees += attendeeRows.length;
  }

  return NextResponse.json({
    importedMeetings,
    importedAttendees,
    matchedEmployees: employeeByEmail.size,
  });
}
