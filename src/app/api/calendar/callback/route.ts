import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL("/calendar-import?error=Missing+authorization+code", request.url),
      );
    }

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3004/api/calendar/callback";

    if (!client_id || !client_secret) {
      return NextResponse.redirect(
        new URL("/calendar-import?error=Google+OAuth+not+configured+on+server", request.url),
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL(`/calendar-import?error=Token+exchange+failed`, request.url),
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    const expiryDate = new Date(Date.now() + expires_in * 1000);
    const service = createServiceRoleClient();

    // Fetch existing token row to preserve refresh_token if new one is not returned (Google only sends it on first consent)
    const { data: existingToken } = await service
      .from("google_tokens")
      .select("refresh_token")
      .eq("user_id", session.userId)
      .maybeSingle();

    const finalRefreshToken = refresh_token || existingToken?.refresh_token;

    const { error: upsertError } = await service.from("google_tokens").upsert({
      user_id: session.userId,
      access_token,
      refresh_token: finalRefreshToken,
      expiry: expiryDate.toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("Failed to save google tokens:", upsertError.message);
      return NextResponse.redirect(
        new URL("/calendar-import?error=Failed+to+save+tokens+in+database", request.url),
      );
    }

    return NextResponse.redirect(new URL("/calendar-import?connected=true", request.url));
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/calendar-import?error=${encodeURIComponent(error.message || "Unknown error")}`, request.url),
    );
  }
}
