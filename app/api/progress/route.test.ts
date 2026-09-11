import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

vi.mock("@/lib/alphabet", () => ({
  loadAlphabet: () => "jfk",
  getMaxLevel: (alphabet: string) => alphabet.length,
}));

describe("progress route", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
  });

  it("GET returns unauthorized without session", async () => {
    mockAuth.mockResolvedValue(null);

    const { GET } = await import("@/app/api/progress/route");
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("GET returns progress for authenticated user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      currentLevel: 2,
      courseCompletedAt: null,
    });

    const { GET } = await import("@/app/api/progress/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      currentLevel: 2,
      courseCompletedAt: null,
      maxLevel: 3,
    });
  });

  it("GET returns 404 when user missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);

    const { GET } = await import("@/app/api/progress/route");
    const response = await GET();

    expect(response.status).toBe(404);
  });

  it("PATCH returns unauthorized without session", async () => {
    mockAuth.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/progress/route");
    const response = await PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({ currentLevel: 2 }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("PATCH updates progress", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ courseCompletedAt: null });
    mockUpdate.mockResolvedValue({
      currentLevel: 2,
      courseCompletedAt: null,
    });

    const { PATCH } = await import("@/app/api/progress/route");
    const response = await PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({ currentLevel: 2 }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("PATCH marks course completed on final level", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ courseCompletedAt: null });
    mockUpdate.mockResolvedValue({
      currentLevel: 3,
      courseCompletedAt: new Date("2026-01-01"),
    });

    const { PATCH } = await import("@/app/api/progress/route");
    const response = await PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({
          currentLevel: 3,
          markCourseCompleted: true,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentLevel: 3,
          courseCompletedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("PATCH skips course completion if already completed", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      courseCompletedAt: new Date("2026-01-01"),
    });
    mockUpdate.mockResolvedValue({
      currentLevel: 3,
      courseCompletedAt: new Date("2026-01-01"),
    });

    const { PATCH } = await import("@/app/api/progress/route");
    await PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({
          currentLevel: 3,
          markCourseCompleted: true,
        }),
      }),
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentLevel: 3 },
      }),
    );
  });

  it("PATCH returns validation error", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const { PATCH } = await import("@/app/api/progress/route");
    const response = await PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({ currentLevel: -1 }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("PATCH returns fallback validation message", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const validation = await import("@/lib/validation");
    const route = await import("@/app/api/progress/route");
    vi.spyOn(validation.patchSchema, "safeParse").mockReturnValue({
      success: false,
      error: { errors: [{}] },
    } as never);

    const response = await route.PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid data");
  });

  it("PATCH returns server error on failure", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockRejectedValue(new Error("db down"));

    const { PATCH } = await import("@/app/api/progress/route");
    const response = await PATCH(
      new Request("http://localhost/api/progress", {
        method: "PATCH",
        body: JSON.stringify({ currentLevel: 2 }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
