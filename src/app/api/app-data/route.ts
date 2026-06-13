import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getAppData } from "@/lib/server/app-data";

export async function GET(request: Request) {
  const session = await requireSession();
  const url = new URL(request.url);
  const range = url.searchParams.get("range") ?? "This week";
  const data = await getAppData(session.role, range as Parameters<typeof getAppData>[1]);
  return NextResponse.json(data);
}
