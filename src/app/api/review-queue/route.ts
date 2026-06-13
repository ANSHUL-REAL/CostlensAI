import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { setReviewedMeeting } from "@/lib/server/app-data";

export async function POST(request: NextRequest) {
  await requireSession();
  const { meetingId, projectId } = (await request.json()) as {
    meetingId?: string;
    projectId?: string;
  };

  if (!meetingId || !projectId) {
    return NextResponse.json(
      { error: "meetingId and projectId are required." },
      { status: 400 },
    );
  }

  await setReviewedMeeting(meetingId, projectId);
  return NextResponse.json({ ok: true });
}
