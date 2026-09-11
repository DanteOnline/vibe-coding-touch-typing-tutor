import { Role } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSyncedUserRole,
  resolveRoleForEmail,
  syncUserRole,
} from "@/lib/roles";

const mockUpdate = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      update: (...args: unknown[]) => mockUpdate(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

describe("roles", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockUpdate.mockReset();
    mockFindUnique.mockReset();
  });

  it("returns ADMIN for configured email", () => {
    vi.stubEnv("ADMIN_EMAIL", "Admin@Example.com");
    expect(resolveRoleForEmail("admin@example.com")).toBe(Role.ADMIN);
  });

  it("returns USER for other emails", () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    expect(resolveRoleForEmail("user@example.com")).toBe(Role.USER);
  });

  it("syncs user role in database", async () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    mockUpdate.mockResolvedValue({ role: Role.ADMIN });

    const result = await syncUserRole("user-1", "admin@example.com");

    expect(result.role).toBe(Role.ADMIN);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { role: Role.ADMIN },
      select: { role: true },
    });
  });

  it("returns stored role when already synced", async () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    mockFindUnique.mockResolvedValue({ role: Role.ADMIN });

    const role = await getSyncedUserRole("user-1", "admin@example.com");

    expect(role).toBe(Role.ADMIN);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns USER when user record is missing", async () => {
    mockFindUnique.mockResolvedValue(null);

    const role = await getSyncedUserRole("missing-user", "admin@example.com");

    expect(role).toBe(Role.USER);
  });

  it("updates role when it drifted from admin email config", async () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    mockFindUnique.mockResolvedValue({ role: Role.USER });
    mockUpdate.mockResolvedValue({ role: Role.ADMIN });

    const role = await getSyncedUserRole("user-1", "admin@example.com");

    expect(role).toBe(Role.ADMIN);
    expect(mockUpdate).toHaveBeenCalled();
  });
});
