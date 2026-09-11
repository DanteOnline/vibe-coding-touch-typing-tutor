import { Role } from "@prisma/client";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Header } from "@/components/layout/Header";

const mockFindUnique = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

vi.mock("@/components/layout/LogoutButton", () => ({
  LogoutButton: () => <button type="button">Выйти</button>,
}));

describe("Header", () => {
  it("renders guest navigation", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null);

    render(await Header());

    expect(screen.getByText("Touch Typing Tutor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Войти" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Регистрация" })).toBeInTheDocument();
  });

  it("renders authenticated navigation", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", email: "test@example.com", role: Role.USER },
    } as never);
    mockFindUnique.mockResolvedValue({ role: Role.USER });

    render(await Header());

    expect(screen.getByRole("link", { name: "Тренажёр" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Выйти" })).toBeInTheDocument();
  });

  it("renders admin link for admin users", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", email: "admin@example.com", role: Role.ADMIN },
    } as never);

    render(await Header());

    expect(screen.getByRole("link", { name: "Админка" })).toBeInTheDocument();
  });

  it("loads admin role from database when missing in session", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", email: "admin@example.com", role: Role.USER },
    } as never);
    mockFindUnique.mockResolvedValue({ role: Role.ADMIN });

    render(await Header());

    expect(screen.getByRole("link", { name: "Админка" })).toBeInTheDocument();
  });
});
