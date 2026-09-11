import { AnalyticsEventType } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { aggregateDailyMetrics, getDailyMetrics } from "@/lib/analytics";

const mockFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    analyticsEvent: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

describe("analytics", () => {
  it("aggregates CTR and bounce rate by day", () => {
    const today = new Date();
    const localDayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const dateKey = localDayStart.toISOString().slice(0, 10);

    const daily = aggregateDailyMetrics(
      [
        {
          sessionId: "visit-1",
          eventType: AnalyticsEventType.TRAINER_IMPRESSION,
          durationMs: null,
          createdAt: today,
        },
        {
          sessionId: "click-1",
          eventType: AnalyticsEventType.SUBSCRIPTION_CLICK,
          durationMs: null,
          createdAt: today,
        },
        {
          sessionId: "click-1",
          eventType: AnalyticsEventType.SUBSCRIPTION_PAGE_EXIT,
          durationMs: 2_000,
          createdAt: today,
        },
      ],
      1,
    );

    expect(daily).toHaveLength(1);
    expect(daily[0]).toMatchObject({
      date: dateKey,
      impressions: 1,
      clicks: 1,
      ctr: 100,
      bounces: 1,
      bounceRate: 100,
    });
  });

  it("ignores exits without duration as non-bounces", () => {
    const today = new Date();

    const daily = aggregateDailyMetrics(
      [
        {
          sessionId: "click-1",
          eventType: AnalyticsEventType.SUBSCRIPTION_CLICK,
          durationMs: null,
          createdAt: today,
        },
        {
          sessionId: "click-1",
          eventType: AnalyticsEventType.SUBSCRIPTION_PAGE_EXIT,
          durationMs: null,
          createdAt: today,
        },
      ],
      1,
    );

    expect(daily[0]?.bounces).toBe(0);
  });

  it("returns zero rates when denominators are zero", () => {
    const daily = aggregateDailyMetrics([], 1);

    expect(daily[0]).toMatchObject({
      impressions: 0,
      clicks: 0,
      ctr: 0,
      bounces: 0,
      bounceRate: 0,
    });
  });

  it("loads events from database", async () => {
    mockFindMany.mockResolvedValue([]);

    const daily = await getDailyMetrics(7);

    expect(daily).toHaveLength(7);
    expect(mockFindMany).toHaveBeenCalled();
  });
});
