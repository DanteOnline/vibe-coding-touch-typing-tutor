import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const mockGetSyncedUserRole = vi.fn();

vi.mock("@/lib/roles", () => ({
  getSyncedUserRole: (...args: unknown[]) => mockGetSyncedUserRole(...args),
}));

vi.mock("@/lib/alphabet", () => ({
  loadAlphabet: () => "jfk",
  getMaxLevel: (alphabet: string) => alphabet.length,
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/components/trainer/TrainerClient", () => ({
  TrainerClient: () => <div>Trainer Client</div>,
}));

vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <div>Login Form</div>,
}));

vi.mock("@/components/auth/RegisterForm", () => ({
  RegisterForm: () => <div>Register Form</div>,
}));

vi.mock("@/components/trainer/SubscribeButton", () => ({
  SubscribeButton: () => <button type="button">Купить подписку</button>,
}));

vi.mock("@/components/subscription/SubscriptionPlaceholder", () => ({
  SubscriptionPlaceholder: () => <div>Subscription Placeholder</div>,
}));

vi.mock("@/components/admin/MetricsDashboard", () => ({
  MetricsDashboard: () => <div>Metrics Dashboard</div>,
}));

describe("app pages", () => {
  it("renders home page for guests", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const HomePage = (await import("@/app/page")).default;
    render(await HomePage());

    expect(screen.getByText("Тренажёр слепой печати")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Начать" })).toBeInTheDocument();
  });

  it("renders home page for authenticated users", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { id: "1", email: "test@example.com" },
    } as never);

    const HomePage = (await import("@/app/page")).default;
    render(await HomePage());

    expect(
      screen.getByRole("link", { name: "Перейти к тренажёру" }),
    ).toBeInTheDocument();
  });

  it("renders login page", async () => {
    const LoginPage = (await import("@/app/login/page")).default;
    render(<LoginPage />);

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("renders register page", async () => {
    const RegisterPage = (await import("@/app/register/page")).default;
    render(<RegisterPage />);

    expect(screen.getByText("Register Form")).toBeInTheDocument();
  });

  it("redirects unauthenticated users from trainer page", async () => {
    redirect.mockClear();
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const TrainerPage = (await import("@/app/trainer/page")).default;

    await expect(TrainerPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders trainer page for authenticated users", async () => {
    redirect.mockReset();
    const { auth } = await import("@/lib/auth");
    const { db } = await import("@/lib/db");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      currentLevel: 1,
      courseCompletedAt: null,
    } as never);

    const TrainerPage = (await import("@/app/trainer/page")).default;
    render(await TrainerPage());

    expect(screen.getByText("Тренажёр")).toBeInTheDocument();
    expect(screen.getByText("Trainer Client")).toBeInTheDocument();
  });

  it("redirects when trainer user is missing in db", async () => {
    redirect.mockClear();
    const { auth } = await import("@/lib/auth");
    const { db } = await import("@/lib/db");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const TrainerPage = (await import("@/app/trainer/page")).default;

    await expect(TrainerPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders subscription page", async () => {
    const SubscriptionPage = (await import("@/app/subscription/page")).default;
    render(<SubscriptionPage />);

    expect(screen.getByText("Subscription Placeholder")).toBeInTheDocument();
  });

  it("redirects non-admin users from admin page", async () => {
    redirect.mockClear();
    const { auth } = await import("@/lib/auth");
    mockGetSyncedUserRole.mockResolvedValue("USER");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);

    const AdminPage = (await import("@/app/admin/page")).default;

    await expect(AdminPage()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("renders admin page for admin users", async () => {
    redirect.mockReset();
    const { auth } = await import("@/lib/auth");
    mockGetSyncedUserRole.mockResolvedValue("ADMIN");

    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com" },
    } as never);

    const AdminPage = (await import("@/app/admin/page")).default;
    render(await AdminPage());

    expect(screen.getByText("Админка")).toBeInTheDocument();
    expect(screen.getByText("Metrics Dashboard")).toBeInTheDocument();
  });

  it("redirects unauthenticated users from admin page", async () => {
    redirect.mockClear();
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const AdminPage = (await import("@/app/admin/page")).default;

    await expect(AdminPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
