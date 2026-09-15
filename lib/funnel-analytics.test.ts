import { AnalyticsEventType } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { getFunnelMetrics } from "@/lib/funnel-analytics";

const mockGroupBy = vi.fn();
const mockUserCount = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    analyticsEvent: {
      groupBy: (...args: unknown[]) => mockGroupBy(...args),
    },
    user: {
      count: (...args: unknown[]) => mockUserCount(...args),
    },
  },
}));

describe("funnel analytics", () => {
  it("aggregates funnel metrics", async () => {
    mockGroupBy.mockResolvedValue([
      { eventType: AnalyticsEventType.LANDING_CTA_CLICK, _count: { _all: 100 } },
      { eventType: AnalyticsEventType.TRAINER_IMPRESSION, _count: { _all: 80 } },
      { eventType: AnalyticsEventType.SUBSCRIPTION_CLICK, _count: { _all: 20 } },
      { eventType: AnalyticsEventType.WAITLIST_JOIN, _count: { _all: 10 } },
    ]);
    mockUserCount.mockResolvedValue(50);

    const funnel = await getFunnelMetrics(30);

    expect(funnel.landingCtaClicks).toBe(100);
    expect(funnel.registrations).toBe(50);
    expect(funnel.trainerImpressions).toBe(80);
    expect(funnel.subscriptionClicks).toBe(20);
    expect(funnel.waitlistJoins).toBe(10);
    expect(funnel.landingToRegisterRate).toBe(50);
  });

  it("returns zero rates without data", async () => {
    mockGroupBy.mockResolvedValue([]);
    mockUserCount.mockResolvedValue(0);

    const funnel = await getFunnelMetrics(7);

    expect(funnel.landingToRegisterRate).toBe(0);
    expect(funnel.registerToTrainerRate).toBe(0);
    expect(funnel.trainerToClickRate).toBe(0);
  });
});
