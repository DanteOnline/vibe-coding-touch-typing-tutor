import { afterEach, describe, expect, it, vi } from "vitest";

describe("db", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    delete (globalThis as { prisma?: unknown }).prisma;
  });

  it("exports prisma client", async () => {
    const { db } = await import("@/lib/db");

    expect(db).toBeDefined();
    expect(db.user).toBeDefined();
  });

  it("uses development logging configuration", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    const { db } = await import("@/lib/db");

    expect(db).toBeDefined();
    expect((globalThis as { prisma?: unknown }).prisma).toBe(db);
  });

  it("uses production logging configuration without global cache", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();

    const { db } = await import("@/lib/db");

    expect(db).toBeDefined();
    expect((globalThis as { prisma?: unknown }).prisma).toBeUndefined();
  });

  it("reuses existing global prisma client", async () => {
    const existingClient = { user: { findUnique: vi.fn() } };
    (globalThis as { prisma?: unknown }).prisma = existingClient;
    vi.resetModules();

    const { db } = await import("@/lib/db");

    expect(db).toBe(existingClient);
  });
});
