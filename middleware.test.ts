import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    auth: vi.fn(),
  })),
}));

describe("middleware", () => {
  it("exports auth middleware and matcher config", async () => {
    const middleware = await import("@/middleware");

    expect(middleware.default).toBeDefined();
    expect(middleware.config.matcher).toEqual([
      "/trainer/:path*",
      "/subscription/:path*",
      "/admin/:path*",
      "/login",
      "/register",
    ]);
  });
});
