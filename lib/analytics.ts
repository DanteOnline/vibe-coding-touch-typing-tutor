import { AnalyticsEventType } from "@prisma/client";

import { analyticsConfig } from "@/config/analytics";
import { db } from "@/lib/db";

export type DailyMetricPoint = {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  bounces: number;
  bounceRate: number;
};

type AnalyticsEventRecord = {
  sessionId: string;
  eventType: AnalyticsEventType;
  durationMs: number | null;
  createdAt: Date;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDateRange(days: number) {
  const today = startOfDay(new Date());
  const dates: Date[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    dates.push(date);
  }

  return dates;
}

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }
  return Number(((numerator / denominator) * 100).toFixed(2));
}

export function aggregateDailyMetrics(
  events: AnalyticsEventRecord[],
  days: number,
): DailyMetricPoint[] {
  const dateRange = buildDateRange(days);
  const eventsByDay = new Map<string, AnalyticsEventRecord[]>();

  for (const event of events) {
    const key = formatDateKey(startOfDay(event.createdAt));
    const bucket = eventsByDay.get(key) ?? [];
    bucket.push(event);
    eventsByDay.set(key, bucket);
  }

  return dateRange.map((date) => {
    const key = formatDateKey(date);
    const dayEvents = eventsByDay.get(key) ?? [];

    const impressions = dayEvents.filter(
      (event) => event.eventType === AnalyticsEventType.TRAINER_IMPRESSION,
    ).length;
    const clicks = dayEvents.filter(
      (event) => event.eventType === AnalyticsEventType.SUBSCRIPTION_CLICK,
    ).length;

    const clickedSessionIds = new Set(
      dayEvents
        .filter((event) => event.eventType === AnalyticsEventType.SUBSCRIPTION_CLICK)
        .map((event) => event.sessionId),
    );

    const bounces = dayEvents.filter(
      (event) =>
        event.eventType === AnalyticsEventType.SUBSCRIPTION_PAGE_EXIT &&
        clickedSessionIds.has(event.sessionId) &&
        (event.durationMs ?? Number.MAX_SAFE_INTEGER) <
          analyticsConfig.bounceThresholdMs,
    ).length;

    return {
      date: key,
      impressions,
      clicks,
      ctr: calculateRate(clicks, impressions),
      bounces,
      bounceRate: calculateRate(bounces, clicks),
    };
  });
}

export async function getDailyMetrics(
  days: number = analyticsConfig.metricsDefaultDays,
) {
  const fromDate = startOfDay(new Date());
  fromDate.setDate(fromDate.getDate() - (days - 1));

  const events = await db.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: fromDate,
      },
    },
    select: {
      sessionId: true,
      eventType: true,
      durationMs: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return aggregateDailyMetrics(events, days);
}
