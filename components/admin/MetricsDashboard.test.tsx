import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MetricsDashboard } from "@/components/admin/MetricsDashboard";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: ({
    formatter,
  }: {
    formatter?: (value: number) => [string, string];
  }) => {
    formatter?.(42);
    return null;
  },
  Line: () => null,
}));

describe("MetricsDashboard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: [
            {
              date: "2026-01-01",
              impressions: 10,
              clicks: 2,
              ctr: 20,
              bounces: 1,
              bounceRate: 50,
            },
          ],
        }),
      }),
    );
  });

  it("shows loading state initially", () => {
    render(<MetricsDashboard />);

    expect(screen.getByText("Загрузка метрик...")).toBeInTheDocument();
  });

  it("renders CTR and bounce charts", async () => {
    render(<MetricsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("CTR")).toBeInTheDocument();
      expect(screen.getByText("Bounce Rate")).toBeInTheDocument();
    });

    expect(screen.getAllByTestId("chart")).toHaveLength(2);
  });

  it("shows error when metrics request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    render(<MetricsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Не удалось загрузить метрики")).toBeInTheDocument();
    });
  });
});
