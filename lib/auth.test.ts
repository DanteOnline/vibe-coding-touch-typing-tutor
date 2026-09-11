import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindUnique = vi.fn();
const capturedConfigs: unknown[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

vi.mock("@/lib/roles", () => ({
  getSyncedUserRole: vi.fn().mockResolvedValue("USER"),
}));

vi.mock("next-auth", () => ({
  default: vi.fn((config: unknown) => {
    capturedConfigs.push(config);
    return {
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  }),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((options: unknown) => options),
}));

describe("auth", () => {
  beforeEach(() => {
    capturedConfigs.length = 0;
    mockFindUnique.mockReset();
  });

  it("hashes password", async () => {
    const { hashPassword } = await import("@/lib/auth");
    const hash = await hashPassword("secret123");

    expect(hash).not.toBe("secret123");
    expect(await bcrypt.compare("secret123", hash)).toBe(true);
  });

  it("authorizes valid credentials", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const { getSyncedUserRole } = await import("@/lib/roles");
    vi.mocked(getSyncedUserRole).mockResolvedValue("USER" as never);

    const config = capturedConfigs[0] as {
      providers: Array<{ authorize: (credentials: unknown) => Promise<unknown> }>;
    };
    const hash = await bcrypt.hash("secret123", 12);

    mockFindUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      passwordHash: hash,
    });

    const user = await config.providers[0].authorize({
      email: "test@example.com",
      password: "secret123",
    });

    expect(user).toEqual({
      id: "user-1",
      email: "test@example.com",
      role: "USER",
    });
  });

  it("rejects invalid credentials payload", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const config = capturedConfigs[0] as {
      providers: Array<{ authorize: (credentials: unknown) => Promise<unknown> }>;
    };

    const user = await config.providers[0].authorize({
      email: "bad-email",
      password: "123",
    });

    expect(user).toBeNull();
  });

  it("rejects unknown user", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const config = capturedConfigs[0] as {
      providers: Array<{ authorize: (credentials: unknown) => Promise<unknown> }>;
    };

    mockFindUnique.mockResolvedValue(null);

    const user = await config.providers[0].authorize({
      email: "test@example.com",
      password: "secret123",
    });

    expect(user).toBeNull();
  });

  it("rejects wrong password", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const config = capturedConfigs[0] as {
      providers: Array<{ authorize: (credentials: unknown) => Promise<unknown> }>;
    };
    const hash = await bcrypt.hash("secret123", 12);

    mockFindUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      passwordHash: hash,
    });

    const user = await config.providers[0].authorize({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(user).toBeNull();
  });

  it("adds user data to jwt token", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const config = capturedConfigs[0] as {
      callbacks: {
        jwt: (args: { token: Record<string, unknown>; user?: unknown }) => unknown;
      };
    };

    const token = config.callbacks.jwt({
      token: {},
      user: { id: "user-1", role: Role.ADMIN },
    });

    expect(token).toEqual({
      id: "user-1",
      role: Role.ADMIN,
    });
  });

  it("syncs role in session callback", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const { getSyncedUserRole } = await import("@/lib/roles");
    vi.mocked(getSyncedUserRole).mockResolvedValue(Role.ADMIN);

    const config = capturedConfigs[0] as {
      callbacks: {
        session: (args: {
          session: { user: { id?: string; email?: string; role?: Role } };
          token: { id?: string; role?: Role };
        }) => Promise<{ user: { id?: string; email?: string; role?: Role } }>;
      };
    };

    const session = await config.callbacks.session({
      session: { user: { email: "admin@example.com" } },
      token: { id: "user-1", role: Role.USER },
    });

    expect(session.user.id).toBe("user-1");
    expect(session.user.role).toBe(Role.ADMIN);
  });

  it("falls back to jwt role without email in session", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const config = capturedConfigs[0] as {
      callbacks: {
        session: (args: {
          session: { user: { role?: Role } };
          token: { role?: Role };
        }) => Promise<{ user: { role?: Role } }>;
      };
    };

    const session = await config.callbacks.session({
      session: { user: {} },
      token: { role: Role.ADMIN },
    });

    expect(session.user.role).toBe(Role.ADMIN);
  });

  it("defaults session role to USER without jwt role", async () => {
    vi.resetModules();
    await import("@/lib/auth");
    const config = capturedConfigs[0] as {
      callbacks: {
        session: (args: {
          session: { user: { role?: Role } };
          token: Record<string, never>;
        }) => Promise<{ user: { role?: Role } }>;
      };
    };

    const session = await config.callbacks.session({
      session: { user: {} },
      token: {},
    });

    expect(session.user.role).toBe(Role.USER);
  });
});
