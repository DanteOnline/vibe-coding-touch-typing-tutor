import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAdmin = vi.fn();
const mockGetDailyMetrics = vi.fn();
const mockGetFunnelMetrics = vi.fn();

vi.mock("@/lib/admin", () => ({
  requireAdminUser: () => mockRequireAdmin(),
}));

vi.mock("@/lib/analytics", () => ({
  getDailyMetrics: (...args: unknown[]) => mockGetDailyMetrics(...args),
}));

vi.mock("@/lib/funnel-analytics", () => ({
  getFunnelMetrics: (...args: unknown[]) => mockGetFunnelMetrics(...args),
}));

describe("GET /api/admin/metrics", () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockGetDailyMetrics.mockReset();
    mockGetFunnelMetrics.mockReset();
    mockGetFunnelMetrics.mockResolvedValue({
      landingCtaClicks: 0,
      registrations: 0,
      trainerImpressions: 0,
      subscriptionClicks: 0,
      waitlistJoins: 0,
      landingToRegisterRate: 0,
      registerToTrainerRate: 0,
      trainerToClickRate: 0,
    });
  });

  it("returns forbidden for non-admin", async () => {
    mockRequireAdmin.mockResolvedValue(null);

    const { GET } = await import("@/app/api/admin/metrics/route");
    const response = await GET(new Request("http://localhost/api/admin/metrics"));

    expect(response.status).toBe(403);
  });

  it("returns daily metrics for admin", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1" });
    mockGetDailyMetrics.mockResolvedValue([
      { date: "2026-01-01", impressions: 1, clicks: 1, ctr: 100, bounces: 0, bounceRate: 0 },
    ]);

    const { GET } = await import("@/app/api/admin/metrics/route");
    const response = await GET(new Request("http://localhost/api/admin/metrics?days=30"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.daily).toHaveLength(1);
    expect(data.funnel).toBeDefined();
  });

  it("returns validation error for invalid query", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1" });

    const { GET } = await import("@/app/api/admin/metrics/route");
    const response = await GET(
      new Request("http://localhost/api/admin/metrics?days=-1"),
    );

    expect(response.status).toBe(400);
  });

  it("uses default days when query param is missing", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1" });
    mockGetDailyMetrics.mockResolvedValue([]);

    const { GET } = await import("@/app/api/admin/metrics/route");
    const response = await GET(new Request("http://localhost/api/admin/metrics"));

    expect(response.status).toBe(200);
    expect(mockGetDailyMetrics).toHaveBeenCalledWith(30);
  });

  it("uses default days when parsed payload omits days", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1" });
    mockGetDailyMetrics.mockResolvedValue([]);
    const route = await import("@/app/api/admin/metrics/route");
    const validation = await import("@/lib/validation");
    vi.spyOn(validation.metricsQuerySchema, "safeParse").mockReturnValue({
      success: true,
      data: {},
    } as never);

    const response = await route.GET(
      new Request("http://localhost/api/admin/metrics?days=30"),
    );

    expect(response.status).toBe(200);
    expect(mockGetDailyMetrics).toHaveBeenCalledWith(30);
  });

  it("returns fallback validation message", async () => {
    mockRequireAdmin.mockResolvedValue({ id: "admin-1" });
    const route = await import("@/app/api/admin/metrics/route");
    const validation = await import("@/lib/validation");
    vi.spyOn(validation.metricsQuerySchema, "safeParse").mockReturnValue({
      success: false,
      error: { errors: [{}] },
    } as never);

    const response = await route.GET(
      new Request("http://localhost/api/admin/metrics?days=30"),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query");
  });
});
