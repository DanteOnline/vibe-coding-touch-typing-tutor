import { AnalyticsEventType } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/admin", () => ({
  getAuthenticatedUser: () => mockAuth(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    analyticsEvent: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

describe("POST /api/analytics/events", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockFindFirst.mockReset();
    mockCreate.mockReset();
  });

  it("returns unauthorized without session", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({
          eventType: AnalyticsEventType.TRAINER_IMPRESSION,
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("creates analytics event", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "event-1" });

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({
          eventType: AnalyticsEventType.SUBSCRIPTION_CLICK,
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockCreate).toHaveBeenCalled();
  });

  it("deduplicates trainer impressions", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    mockFindFirst.mockResolvedValue({ id: "existing" });

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({
          eventType: AnalyticsEventType.TRAINER_IMPRESSION,
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.duplicate).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("requires duration for page exit", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({
          eventType: AnalyticsEventType.SUBSCRIPTION_PAGE_EXIT,
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns validation error", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns fallback validation message", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    const validation = await import("@/lib/validation");
    vi.spyOn(validation.analyticsEventSchema, "safeParse").mockReturnValue({
      success: false,
      error: { errors: [{}] },
    } as never);

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid data");
  });

  it("returns server error on failure", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    mockFindFirst.mockRejectedValue(new Error("db down"));

    const { POST } = await import("@/app/api/analytics/events/route");
    const response = await POST(
      new Request("http://localhost/api/analytics/events", {
        method: "POST",
        body: JSON.stringify({
          eventType: AnalyticsEventType.TRAINER_IMPRESSION,
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
