import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

describe("auth route", () => {
  it("re-exports auth handlers", async () => {
    const route = await import("@/app/api/auth/[...nextauth]/route");
    const auth = await import("@/lib/auth");

    expect(route.GET).toBe(auth.handlers.GET);
    expect(route.POST).toBe(auth.handlers.POST);
  });
});
