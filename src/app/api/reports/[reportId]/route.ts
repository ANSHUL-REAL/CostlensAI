import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getAppData } from "@/lib/server/app-data";
import { toCsv } from "@/lib/server/csv";

function buildRows(reportId: string, data: Awaited<ReturnType<typeof getAppData>>) {
  switch (reportId) {
    case "project-cost":
      return data.projects.map((project) => ({
        project: project.name,
        owner: project.owner,
        priority: project.priority,
        budget_inr: project.budget,
        spent_inr: project.spent,
        usage_pct: project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0,
        status: project.status,
        keywords: project.keywords.join(" | "),
      }));

    case "meeting-cost":
      return data.meetings.map((meeting) => ({
        title: meeting.title,
        start: meeting.start,
        duration_minutes: meeting.durationMinutes,
        organizer: meeting.organizer,
        project: meeting.projectName,
        ai_confidence: Number(meeting.aiConfidence.toFixed(2)),
        status: meeting.status,
        needs_review: meeting.needsReview,
        attendee_count: meeting.attendees.length,
        attendees: meeting.attendees.map((attendee) => attendee.name).join(" | "),
        total_cost_inr: meeting.totalCost,
      }));

    case "anomalies":
      return data.anomalies.map((anomaly) => ({
        type: anomaly.type,
        severity: anomaly.severity,
        project: anomaly.project ?? "General",
        message: anomaly.message,
        estimated_loss_inr: anomaly.estimatedLoss,
        suggested_action: anomaly.suggestedAction,
        created_at: anomaly.createdAt,
      }));

    case "finance-summary":
      return [
        { metric: "Total HR meeting cost", value: data.summary.totalCost },
        { metric: "Potential monthly savings", value: data.summary.potentialSavings },
        { metric: "Meetings analyzed", value: data.summary.meetingCount },
        { metric: "Low-confidence meetings", value: data.summary.lowConfidence },
        { metric: "Unclassified meetings", value: data.summary.unclassified },
        { metric: "Open anomalies", value: data.summary.openAnomalies },
      ];

    default:
      return null;
  }
}

export async function GET(_: NextRequest, context: { params: { reportId: string } }) {
  const session = await requireSession();
  const data = await getAppData(session.role);
  const rows = buildRows(context.params.reportId, data);

  if (!rows) {
    return NextResponse.json({ error: "Unknown report type." }, { status: 404 });
  }

  const csv = toCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${context.params.reportId}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
