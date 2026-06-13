import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  await requireSession();

  const body = (await request.json()) as {
    name: string;
    email: string;
    role: string;
    department: string;
    hourlyRate: number;
    costBand: string;
    status: "active" | "inactive";
  };

  const service = createServiceRoleClient();
  const { error } = await service.from("employees").insert({
    name: body.name,
    email: body.email,
    role: body.role,
    department: body.department,
    hourly_rate: body.hourlyRate,
    cost_band: body.costBand,
    status: body.status,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
