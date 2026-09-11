import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { authConfig } from "@/lib/auth.config";

function createRequest(pathname: string, origin = "http://localhost:3000") {
  return {
    nextUrl: new URL(`${origin}${pathname}`),
  };
}

describe("authConfig callbacks", () => {
  it("allows public routes for guests", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: null,
      request: createRequest("/"),
    } as never);

    expect(result).toBe(true);
  });

  it("blocks trainer route for guests", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: null,
      request: createRequest("/trainer"),
    } as never);

    expect(result).toBe(false);
  });

  it("blocks subscription route for guests", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: null,
      request: createRequest("/subscription"),
    } as never);

    expect(result).toBe(false);
  });

  it("blocks admin route for guests", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: null,
      request: createRequest("/admin"),
    } as never);

    expect(result).toBe(false);
  });

  it("allows trainer route for authenticated users", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: { user: { id: "1" } },
      request: createRequest("/trainer"),
    } as never);

    expect(result).toBe(true);
  });

  it("redirects authenticated users away from login", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: { user: { id: "1" } },
      request: createRequest("/login"),
    } as never);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("location")).toBe(
      "http://localhost:3000/trainer",
    );
  });

  it("redirects authenticated users away from register", () => {
    const result = authConfig.callbacks!.authorized!({
      auth: { user: { id: "1" } },
      request: createRequest("/register"),
    } as never);

    expect(result).toBeInstanceOf(Response);
  });

  it("adds user id and role to jwt token", async () => {
    const token = await authConfig.callbacks!.jwt!({
      token: {},
      user: { id: "user-1", role: "ADMIN" },
    } as never);

    expect(token.id).toBe("user-1");
    expect(token.role).toBe("ADMIN");
  });

  it("returns jwt token unchanged without user", async () => {
    const token = { id: "existing" };
    const result = await authConfig.callbacks!.jwt!({
      token,
      user: undefined,
    } as never);

    expect(result).toEqual(token);
  });

  it("adds user id and role to session", async () => {
    const session = await authConfig.callbacks!.session!({
      session: { user: { email: "a@b.com" } },
      token: { id: "user-1", role: "ADMIN" },
    } as never);

    expect(session.user.id).toBe("user-1");
    expect(session.user.role).toBe("ADMIN");
  });

  it("defaults session role to USER", async () => {
    const session = await authConfig.callbacks!.session!({
      session: { user: { email: "a@b.com" } },
      token: { id: "user-1" },
    } as never);

    expect(session.user.role).toBe(Role.USER);
  });

  it("returns session unchanged without token id", async () => {
    const session = { user: { email: "a@b.com" } };
    const result = await authConfig.callbacks!.session!({
      session,
      token: {},
    } as never);

    expect(result).toEqual(session);
  });
});
