import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthenticatedUser,
  requireAdminUser,
} from "@/lib/admin";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

describe("admin helpers", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockFindUnique.mockReset();
  });

  it("returns null without session", async () => {
    mockAuth.mockResolvedValue(null);
    expect(await getAuthenticatedUser()).toBeNull();
  });

  it("returns session user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    expect(await getAuthenticatedUser()).toEqual({ id: "user-1" });
  });

  it("requires admin role", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1" } });
    mockFindUnique.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      role: Role.ADMIN,
    });

    const admin = await requireAdminUser();
    expect(admin?.role).toBe(Role.ADMIN);
  });

  it("rejects non-admin user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      role: Role.USER,
    });

    expect(await requireAdminUser()).toBeNull();
  });

  it("returns null without authenticated session", async () => {
    mockAuth.mockResolvedValue(null);

    expect(await requireAdminUser()).toBeNull();
  });

  it("returns null when admin user is missing in database", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);

    expect(await requireAdminUser()).toBeNull();
  });
});
