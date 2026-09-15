import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscribeButton } from "@/components/trainer/SubscribeButton";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const mockTrackAnalyticsEvent = vi.fn(async () => ({ success: true }));

vi.mock("@/lib/analytics-client", () => ({
  createAnalyticsSessionId: vi.fn(() => "00000000-0000-4000-8000-000000000099"),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe("SubscribeButton", () => {
  beforeEach(() => {
    push.mockReset();
    sessionStorage.clear();
  });

  it("tracks impression once per visit", async () => {
    mockTrackAnalyticsEvent.mockClear();
    render(<SubscribeButton />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalled();
    });

    expect(sessionStorage.getItem("trainer_impression_sent")).toBe("1");
  });

  it("navigates to subscription on click", async () => {
    const user = userEvent.setup();
    render(<SubscribeButton />);

    await user.click(
      screen.getByRole("button", { name: "Разблокировать все уровни" }),
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/subscription?sid=00000000-0000-4000-8000-000000000099",
      );
    });
  });

  it("reuses visit session id and skips duplicate impressions", async () => {
    sessionStorage.setItem(
      "trainer_visit_session_id",
      "00000000-0000-4000-8000-000000000001",
    );
    sessionStorage.setItem("trainer_impression_sent", "1");
    mockTrackAnalyticsEvent.mockClear();

    render(<SubscribeButton />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
    });
  });

  it("tracks impression with existing visit session id", async () => {
    sessionStorage.setItem(
      "trainer_visit_session_id",
      "00000000-0000-4000-8000-000000000001",
    );
    mockTrackAnalyticsEvent.mockClear();

    render(<SubscribeButton />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
        eventType: "TRAINER_IMPRESSION",
        sessionId: "00000000-0000-4000-8000-000000000001",
      });
    });
  });

  it("resets loading state when click tracking fails", async () => {
    mockTrackAnalyticsEvent.mockImplementation(async (payload) => {
      if (payload.eventType === "SUBSCRIPTION_CLICK") {
        throw new Error("network");
      }
      return { success: true };
    });

    const user = userEvent.setup();
    render(<SubscribeButton />);

    await user.click(
      screen.getByRole("button", { name: "Разблокировать все уровни" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Разблокировать все уровни" }),
      ).toBeEnabled();
    });
    expect(push).not.toHaveBeenCalled();
  });
});
