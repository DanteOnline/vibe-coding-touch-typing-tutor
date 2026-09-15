import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockJoinWaitlist = vi.fn();

vi.mock("@/lib/admin", () => ({
  getAuthenticatedUser: () => mockAuth(),
}));

vi.mock("@/lib/waitlist", () => ({
  joinWaitlist: (...args: unknown[]) => mockJoinWaitlist(...args),
}));

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockJoinWaitlist.mockReset();
  });

  it("returns unauthorized without session", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/waitlist/route");
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("joins waitlist", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    mockJoinWaitlist.mockResolvedValue({
      waitlistJoinedAt: new Date("2026-01-01"),
    });

    const { POST } = await import("@/app/api/waitlist/route");
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("returns validation error", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });

    const { POST } = await import("@/app/api/waitlist/route");
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({ sessionId: "bad" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns fallback validation message", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    const validation = await import("@/lib/validation");
    vi.spyOn(validation.waitlistSchema, "safeParse").mockReturnValue({
      success: false,
      error: { errors: [{}] },
    } as never);

    const { POST } = await import("@/app/api/waitlist/route");
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({ sessionId: "00000000-0000-4000-8000-000000000001" }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid data");
  });

  it("returns not found when user missing", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    mockJoinWaitlist.mockResolvedValue(null);

    const { POST } = await import("@/app/api/waitlist/route");
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(404);
  });

  it("returns server error on failure", async () => {
    mockAuth.mockResolvedValue({ id: "user-1" });
    mockJoinWaitlist.mockRejectedValue(new Error("db down"));

    const { POST } = await import("@/app/api/waitlist/route");
    const response = await POST(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
