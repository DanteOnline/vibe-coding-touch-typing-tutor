import { AnalyticsEventType } from "@prisma/client";

import { analyticsConfig } from "@/config/analytics";
import { db } from "@/lib/db";

export type FunnelMetrics = {
  landingCtaClicks: number;
  registrations: number;
  trainerImpressions: number;
  subscriptionClicks: number;
  waitlistJoins: number;
  landingToRegisterRate: number;
  registerToTrainerRate: number;
  trainerToClickRate: number;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calculateRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

export async function getFunnelMetrics(
  days: number = analyticsConfig.metricsDefaultDays,
): Promise<FunnelMetrics> {
  const fromDate = startOfDay(new Date());
  fromDate.setDate(fromDate.getDate() - (days - 1));

  const [events, registrations] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ["eventType"],
      where: {
        createdAt: { gte: fromDate },
      },
      _count: { _all: true },
    }),
    db.user.count({
      where: {
        createdAt: { gte: fromDate },
      },
    }),
  ]);

  const counts = new Map<AnalyticsEventType, number>();
  for (const row of events) {
    counts.set(row.eventType, row._count._all);
  }

  const landingCtaClicks =
    counts.get(AnalyticsEventType.LANDING_CTA_CLICK) ?? 0;
  const trainerImpressions =
    counts.get(AnalyticsEventType.TRAINER_IMPRESSION) ?? 0;
  const subscriptionClicks =
    counts.get(AnalyticsEventType.SUBSCRIPTION_CLICK) ?? 0;
  const waitlistJoins = counts.get(AnalyticsEventType.WAITLIST_JOIN) ?? 0;

  return {
    landingCtaClicks,
    registrations,
    trainerImpressions,
    subscriptionClicks,
    waitlistJoins,
    landingToRegisterRate: calculateRate(registrations, landingCtaClicks),
    registerToTrainerRate: calculateRate(trainerImpressions, registrations),
    trainerToClickRate: calculateRate(subscriptionClicks, trainerImpressions),
  };
}
