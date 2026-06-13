import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { attributeMeetingFallback, getAppData } from "@/lib/server/app-data";
import { attributeMeetingsWithGemini } from "@/lib/server/gemini";
import { createServiceRoleClient } from "@/lib/supabase/server";

type AttributionUpdate = {
  id: string;
  projectId: string | null;
  confidence: number;
  reason: string;
  needsReview: boolean;
  status: "attributed" | "unclassified";
};

export async function POST() {
  await requireSession();

  const service = createServiceRoleClient();
  const payload = await getAppData("admin");
  let updates: AttributionUpdate[] = [];
  let provider: "gemini" | "fallback" = process.env.GEMINI_API_KEY ? "gemini" : "fallback";

  try {
    updates = await attributeMeetingsWithGemini(payload.meetings, payload.projects);
  } catch {
    provider = "fallback";
    updates = payload.meetings.map((meeting) => {
      const fallback = attributeMeetingFallback(meeting, payload.projects);
      return {
        id: meeting.id,
        projectId: fallback.projectId,
        confidence: fallback.confidence,
        reason: fallback.reason,
        needsReview: fallback.needsReview,
        status: fallback.status,
      };
    });
  }

  for (const update of updates) {
    const { error } = await service
      .from("meetings")
      .update({
        project_id: update.projectId,
        ai_confidence: update.confidence,
        ai_reason: update.reason,
        needs_review: update.needsReview,
        status: update.status,
      })
      .eq("id", update.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  return NextResponse.json({ updated: updates.length, provider });
}
