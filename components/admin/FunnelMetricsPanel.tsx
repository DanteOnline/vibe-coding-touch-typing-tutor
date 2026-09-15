"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FunnelMetrics } from "@/lib/funnel-analytics";

type FunnelMetricsPanelProps = {
  funnel: FunnelMetrics;
};

export function FunnelMetricsPanel({ funnel }: FunnelMetricsPanelProps) {
  const items = [
    { label: "Клики CTA на лендинге", value: funnel.landingCtaClicks },
    { label: "Регистрации", value: funnel.registrations },
    { label: "Показы на тренажёре", value: funnel.trainerImpressions },
    { label: "Клики подписки", value: funnel.subscriptionClicks },
    { label: "Waitlist", value: funnel.waitlistJoins },
  ];

  const rates = [
    {
      label: "Landing → Register",
      value: `${funnel.landingToRegisterRate}%`,
    },
    {
      label: "Register → Trainer",
      value: `${funnel.registerToTrainerRate}%`,
    },
    {
      label: "Trainer → Click",
      value: `${funnel.trainerToClickRate}%`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Воронка лендинга</CardTitle>
        <CardDescription>
          Landing CTA → регистрация → тренажёр → клик подписки → waitlist
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {rates.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
