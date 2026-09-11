import { AnalyticsEventType } from "@prisma/client";
import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { analyticsEventSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const { eventType, sessionId, durationMs } = parsed.data;

    if (
      eventType === AnalyticsEventType.SUBSCRIPTION_PAGE_EXIT &&
      durationMs === undefined
    ) {
      return NextResponse.json(
        { error: "durationMs is required for page exit events" },
        { status: 400 },
      );
    }

    if (eventType === AnalyticsEventType.TRAINER_IMPRESSION) {
      const existingImpression = await db.analyticsEvent.findFirst({
        where: {
          userId: user.id,
          sessionId,
          eventType: AnalyticsEventType.TRAINER_IMPRESSION,
        },
      });

      if (existingImpression) {
        return NextResponse.json({ success: true, duplicate: true });
      }
    }

    await db.analyticsEvent.create({
      data: {
        userId: user.id,
        sessionId,
        eventType,
        durationMs,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to record analytics event" },
      { status: 500 },
    );
  }
}
