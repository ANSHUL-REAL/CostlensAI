import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  organizer?: { email?: string };
  attendees?: Array<{ email?: string; responseStatus?: string }>;
  recurringEventId?: string;
};

async function getOrRefreshToken(userId: string) {
  const service = createServiceRoleClient();
  const { data: tokenData, error } = await service
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !tokenData) {
    throw new Error("Google account is not connected.");
  }

  const isExpired = new Date(tokenData.expiry).getTime() - 60 * 1000 < Date.now();
  if (!isExpired) {
    return tokenData.access_token;
  }

  if (!tokenData.refresh_token) {
    throw new Error("Connection expired. Please reconnect your Google account.");
  }

  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error("Google OAuth credentials are missing on the server.");
  }

  const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token: tokenData.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!refreshResponse.ok) {
    throw new Error("Failed to refresh Google Calendar connection.");
  }

  const refreshData = await refreshResponse.json();
  const { access_token, expires_in } = refreshData;
  const expiryDate = new Date(Date.now() + expires_in * 1000);

  await service
    .from("google_tokens")
    .update({
      access_token,
      expiry: expiryDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return access_token;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => ({}));
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing startDate or endDate parameters." },
        { status: 400 },
      );
    }

    const accessToken = await getOrRefreshToken(session.userId);

    const timeMin = new Date(startDate).toISOString();
    const timeMax = new Date(endDate).toISOString();

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin,
      )}&timeMax=${encodeURIComponent(
        timeMax,
      )}&singleEvents=true&orderBy=startTime&maxResults=250`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!calendarResponse.ok) {
      const errText = await calendarResponse.text();
      console.error("Google Calendar API error:", errText);
      return NextResponse.json(
        { error: `Google Calendar API error: ${calendarResponse.status}` },
        { status: 400 },
      );
    }

    const calendarData = await calendarResponse.json();
    const events = (calendarData.items || []) as GoogleCalendarEvent[];

    const service = createServiceRoleClient();

    // Fetch employee directory for cost calculations
    const { data: employees, error: employeesError } = await service
      .from("employees")
      .select("id, email, hourly_rate, name");

    if (employeesError) {
      return NextResponse.json({ error: employeesError.message }, { status: 500 });
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
      const startStr = event.start?.dateTime || event.start?.date;
      const endStr = event.end?.dateTime || event.end?.date;
      if (!startStr || !endStr) continue;

      const start = new Date(startStr);
      const end = new Date(endStr);
      const durationMinutes = Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
      );

      const attendees = (event.attendees ?? []).filter(
        (attendee): attendee is { email: string; responseStatus?: string } =>
          Boolean(attendee.email),
      );

      // Map attendees to cost contributions
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
            title: event.summary || "Untitled Meeting",
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
        console.error("Meeting upsert error:", meetingError.message);
        continue;
      }

      const meetingId = upsertedMeeting.id as string;

      // Clear and re-insert attendees
      await service.from("meeting_attendees").delete().eq("meeting_id", meetingId);

      if (attendeeRows.length > 0) {
        const { error: attendeesError } = await service.from("meeting_attendees").insert(
          attendeeRows.map((attendee) => ({
            meeting_id: meetingId,
            ...attendee,
          })),
        );

        if (attendeesError) {
          console.error("Attendees insert error:", attendeesError.message);
        }
      }

      importedMeetings += 1;
      importedAttendees += attendeeRows.length;
    }

    return NextResponse.json({
      ok: true,
      importedMeetings,
      importedAttendees,
    });
  } catch (error: any) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json({ error: error.message || "Unknown sync error" }, { status: 500 });
  }
}
