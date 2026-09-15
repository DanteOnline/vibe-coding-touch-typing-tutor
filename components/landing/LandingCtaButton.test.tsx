import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LandingCtaButton } from "@/components/landing/LandingCtaButton";

const push = vi.fn();
const mockTrackAnalyticsEvent = vi.fn(async () => ({ success: true }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/analytics-client", () => ({
  createAnalyticsSessionId: vi.fn(() => "00000000-0000-4000-8000-000000000099"),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe("LandingCtaButton", () => {
  beforeEach(() => {
    push.mockReset();
    mockTrackAnalyticsEvent.mockClear();
  });

  it("tracks click and navigates", async () => {
    const user = userEvent.setup();
    render(
      <LandingCtaButton href="/register" label="Разблокировать все уровни" />,
    );

    await user.click(
      screen.getByRole("button", { name: "Разблокировать все уровни" }),
    );

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith("/register");
    });
  });

  it("renders link without tracking", () => {
    render(
      <LandingCtaButton
        href="/trainer"
        label="Попробовать бесплатно"
        trackClick={false}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Попробовать бесплатно" }),
    ).toBeInTheDocument();
  });

  it("navigates when analytics tracking fails", async () => {
    mockTrackAnalyticsEvent.mockRejectedValueOnce(new Error("analytics down"));
    const user = userEvent.setup();

    render(
      <LandingCtaButton href="/register" label="Разблокировать все уровни" />,
    );

    await user.click(
      screen.getByRole("button", { name: "Разблокировать все уровни" }),
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/register");
    });
  });
});
