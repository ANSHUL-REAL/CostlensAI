import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireSession();

  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3004/api/calendar/callback";

  const hasGoogleCredentials =
    Boolean(client_id) &&
    Boolean(client_secret);

  if (!hasGoogleCredentials) {
    return NextResponse.json(
      {
        connected: false,
        configured: false,
        message:
          "Google Calendar OAuth is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local to enable live sync.",
      },
      { status: 400 },
    );
  }

  // Check if token already exists for the user
  const service = createServiceRoleClient();
  const { data: existingToken } = await service
    .from("google_tokens")
    .select("user_id, refresh_token")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (existingToken?.refresh_token) {
    return NextResponse.json({
      connected: true,
      configured: true,
      message: "Google account is already connected.",
    });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(
    redirect_uri,
  )}&scope=${encodeURIComponent(
    "https://www.googleapis.com/auth/calendar.readonly",
  )}&access_type=offline&prompt=consent`;

  return NextResponse.json({
    connected: false,
    configured: true,
    url: authUrl,
  });
}


