import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
}));

vi.mock("@/lib/roles", () => ({
  resolveRoleForEmail: vi.fn().mockReturnValue("USER"),
}));

describe("POST /api/register", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCreate.mockReset();
  });

  it("registers a new user", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "1" });

    const { POST } = await import("@/app/api/register/route");
    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        passwordHash: "hashed-password",
        role: "USER",
      },
    });
  });

  it("assigns admin role for admin email", async () => {
    const { resolveRoleForEmail } = await import("@/lib/roles");
    vi.mocked(resolveRoleForEmail).mockReturnValue("ADMIN" as never);

    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "1" });

    const { POST } = await import("@/app/api/register/route");
    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: "ADMIN" }),
    });
  });

  it("returns validation error for invalid payload", async () => {
    const { POST } = await import("@/app/api/register/route");
    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({ email: "bad", password: "123" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns fallback validation message", async () => {
    const validation = await import("@/lib/validation");
    const route = await import("@/app/api/register/route");
    vi.spyOn(validation.registerSchema, "safeParse").mockReturnValue({
      success: false,
      error: { errors: [{}] },
    } as never);

    const response = await route.POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Некорректные данные");
  });

  it("returns conflict for existing email", async () => {
    mockFindUnique.mockResolvedValue({ id: "1" });

    const { POST } = await import("@/app/api/register/route");
    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(409);
  });

  it("returns server error on failure", async () => {
    mockFindUnique.mockRejectedValue(new Error("db down"));

    const { POST } = await import("@/app/api/register/route");
    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
