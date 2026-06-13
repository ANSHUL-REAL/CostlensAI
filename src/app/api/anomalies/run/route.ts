import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getAppData } from "@/lib/server/app-data";

export async function POST() {
  const session = await requireSession();
  const data = await getAppData(session.role);
  return NextResponse.json({
    issues: data.anomalies.length,
    estimatedLoss: data.anomalies.reduce((sum, anomaly) => sum + anomaly.estimatedLoss, 0),
  });
}
