import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, context: { params: { projectId: string } }) {
  await requireSession();

  const body = (await request.json()) as {
    name: string;
    description: string;
    budget: number;
    priority: "High" | "Medium" | "Low" | "None";
    keywords: string[];
    status: "active" | "archived";
  };

  const service = createServiceRoleClient();
  const { error } = await service
    .from("projects")
    .update({
      name: body.name,
      description: body.description,
      budget: body.budget,
      priority: body.priority,
      keywords: body.keywords,
      status: body.status,
    })
    .eq("id", context.params.projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
