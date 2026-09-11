"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DailyMetricPoint } from "@/lib/analytics";

type MetricsResponse = {
  daily: DailyMetricPoint[];
};

function MetricChart({
  title,
  description,
  dataKey,
  color,
  data,
}: {
  title: string;
  description: string;
  dataKey: "ctr" | "bounceRate";
  color: string;
  data: DailyMetricPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis unit="%" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => [`${value}%`, title]} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard() {
  const [data, setData] = useState<DailyMetricPoint[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics?days=30")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load metrics");
        }
        return response.json() as Promise<MetricsResponse>;
      })
      .then((payload) => {
        setData(payload.daily);
      })
      .catch(() => {
        setError("Не удалось загрузить метрики");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Загрузка метрик...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <div className="grid gap-6">
      <MetricChart
        title="CTR"
        description="Доля кликов по кнопке «Купить подписку» от показов на тренажёре"
        dataKey="ctr"
        color="#2563eb"
        data={data}
      />
      <MetricChart
        title="Bounce Rate"
        description="Доля быстрых уходов со страницы подписки после клика"
        dataKey="bounceRate"
        color="#dc2626"
        data={data}
      />
    </div>
  );
}
