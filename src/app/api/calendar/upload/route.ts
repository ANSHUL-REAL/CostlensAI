import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ParsedIcsEvent = {
  id: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  organizerEmail?: string;
  attendees: Array<{ email: string }>;
};

function parseICSDate(dateStr: string, keyParts: string[]): Date {
  const cleanStr = dateStr.replace(/[-:]/g, ""); // Remove separators
  
  if (cleanStr.length >= 15) {
    const y = parseInt(cleanStr.substring(0, 4), 10);
    const m = parseInt(cleanStr.substring(4, 6), 10) - 1;
    const d = parseInt(cleanStr.substring(6, 8), 10);
    const hr = parseInt(cleanStr.substring(9, 11), 10);
    const min = parseInt(cleanStr.substring(11, 13), 10);
    const sec = parseInt(cleanStr.substring(13, 15), 10);

    const isUTC = cleanStr.endsWith("Z");
    if (isUTC) {
      return new Date(Date.UTC(y, m, d, hr, min, sec));
    } else {
      return new Date(y, m, d, hr, min, sec);
    }
  }

  if (cleanStr.length === 8) {
    const y = parseInt(cleanStr.substring(0, 4), 10);
    const m = parseInt(cleanStr.substring(4, 6), 10) - 1;
    const d = parseInt(cleanStr.substring(6, 8), 10);
    return new Date(y, m, d);
  }

  return new Date(dateStr);
}

function parseICS(icsContent: string): ParsedIcsEvent[] {
  const events: ParsedIcsEvent[] = [];
  let currentEvent: Partial<ParsedIcsEvent> & { attendees: Array<{ email: string }> } | null = null;
  
  const lines = icsContent.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle folded lines (continuation lines starting with a space or tab)
    while (i + 1 < lines.length && (lines[i + 1].startsWith(" ") || lines[i + 1].startsWith("\t"))) {
      line += lines[i + 1].substring(1);
      i++;
    }
    
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    
    const keyPart = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);
    
    const keyParts = keyPart.split(";");
    const key = keyParts[0].trim();
    
    if (key === "BEGIN" && value.trim() === "VEVENT") {
      currentEvent = { attendees: [] };
    } else if (key === "END" && value.trim() === "VEVENT" && currentEvent) {
      if (currentEvent.summary && currentEvent.start && currentEvent.end) {
        events.push({
          id: currentEvent.id || `ics-${Math.random().toString(36).substr(2, 9)}`,
          summary: currentEvent.summary,
          description: currentEvent.description || "",
          start: currentEvent.start,
          end: currentEvent.end,
          organizerEmail: currentEvent.organizerEmail,
          attendees: currentEvent.attendees,
        });
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (key === "SUMMARY") {
        currentEvent.summary = value.trim();
      } else if (key === "DESCRIPTION") {
        currentEvent.description = value.trim().replace(/\\n/g, "\n").replace(/\\,/g, ",");
      } else if (key === "UID") {
        currentEvent.id = value.trim();
      } else if (key.startsWith("DTSTART")) {
        currentEvent.start = parseICSDate(value.trim(), keyParts);
      } else if (key.startsWith("DTEND")) {
        currentEvent.end = parseICSDate(value.trim(), keyParts);
      } else if (key === "ORGANIZER") {
        const emailMatch = value.match(/mailto:([^>\s]+)/i);
        currentEvent.organizerEmail = emailMatch ? emailMatch[1] : value.replace("mailto:", "").trim();
      } else if (key === "ATTENDEE") {
        const emailMatch = value.match(/mailto:([^>\s]+)/i);
        if (emailMatch) {
          currentEvent.attendees.push({ email: emailMatch[1] });
        }
      }
    }
  }
  return events;
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Missing file parameter." }, { status: 400 });
    }
    
    const icsContent = await file.text();
    const events = parseICS(icsContent);
    
    if (events.length === 0) {
      return NextResponse.json(
        { error: "No valid VEVENT elements found in the iCalendar file." },
        { status: 400 },
      );
    }
    
    const service = createServiceRoleClient();
    
    // Fetch employees for cost matching
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
      const start = event.start;
      const end = event.end;
      const durationMinutes = Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
      );
      
      const attendeeRows = event.attendees.map((attendee) => {
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
            title: event.summary || "Manual Upload Meeting",
            description: event.description || "",
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            duration_minutes: durationMinutes,
            organizer_email: event.organizerEmail || null,
            project_id: null,
            ai_confidence: 0,
            ai_reason: "Awaiting attribution.",
            total_cost: totalCost,
            is_recurring: false,
            needs_review: false,
            status: "imported",
          },
          { onConflict: "calendar_event_id" },
        )
        .select("id")
        .single();
        
      if (meetingError) {
        console.error("Manual meeting upsert error:", meetingError.message);
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
          console.error("Manual attendees insert error:", attendeesError.message);
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
    console.error("Manual ICS upload error:", error);
    return NextResponse.json({ error: error.message || "Unknown import error" }, { status: 500 });
  }
}
