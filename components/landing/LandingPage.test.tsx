import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LandingPage } from "@/components/landing/LandingPage";

vi.mock("@/components/landing/LandingCtaButton", () => ({
  LandingCtaButton: ({ label }: { label: string }) => (
    <button type="button">{label}</button>
  ),
}));

describe("LandingPage", () => {
  it("renders hero for guests", () => {
    render(<LandingPage isAuthenticated={false} isOnWaitlist={false} />);

    expect(
      screen.getByRole("heading", {
        name: "Научись слепой печати за 15 минут в день",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Разблокировать все уровни" }).length,
    ).toBeGreaterThan(0);
  });

  it("renders continue cta for waitlist users", () => {
    render(<LandingPage isAuthenticated={true} isOnWaitlist={true} />);

    expect(
      screen.getAllByRole("button", { name: "Продолжить обучение" }).length,
    ).toBeGreaterThan(0);
  });
});
