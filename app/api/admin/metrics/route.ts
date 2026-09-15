import { NextResponse } from "next/server";

import { getDailyMetrics } from "@/lib/analytics";
import { getFunnelMetrics } from "@/lib/funnel-analytics";
import { requireAdminUser } from "@/lib/admin";
import { analyticsConfig } from "@/config/analytics";
import { metricsQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = metricsQuerySchema.safeParse({
    days: searchParams.get("days") ?? analyticsConfig.metricsDefaultDays,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  const days = parsed.data.days ?? analyticsConfig.metricsDefaultDays;
  const [daily, funnel] = await Promise.all([
    getDailyMetrics(days),
    getFunnelMetrics(days),
  ]);

  return NextResponse.json({ daily, funnel });
}
