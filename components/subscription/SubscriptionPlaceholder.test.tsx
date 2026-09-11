import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionPlaceholder } from "@/components/subscription/SubscriptionPlaceholder";

let searchParams = new URLSearchParams(
  "sid=00000000-0000-4000-8000-000000000001",
);

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const mockTrackAnalyticsEvent = vi.fn(async () => ({ success: true }));

vi.mock("@/lib/analytics-client", () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe("SubscriptionPlaceholder", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams(
      "sid=00000000-0000-4000-8000-000000000001",
    );
    mockTrackAnalyticsEvent.mockClear();
  });

  it("renders placeholder content", () => {
    render(<SubscriptionPlaceholder />);

    expect(screen.getByText("Раздел в разработке")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Вернуться к тренажёру" }),
    ).toBeInTheDocument();
  });

  it("tracks page view and exit on unmount", async () => {
    const { unmount } = render(<SubscriptionPlaceholder />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_VIEW",
        }),
      );
    });

    unmount();

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_EXIT",
          sessionId: "00000000-0000-4000-8000-000000000001",
        }),
      );
    });
  });

  it("tracks exit on visibility change", async () => {
    render(<SubscriptionPlaceholder />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_VIEW",
        }),
      );
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_EXIT",
        }),
      );
    });
  });

  it("allows retry after failed exit tracking", async () => {
    mockTrackAnalyticsEvent.mockImplementation(async (payload) => {
      if (payload.eventType === "SUBSCRIPTION_PAGE_EXIT") {
        throw new Error("network");
      }
      return { success: true };
    });

    const { unmount } = render(<SubscriptionPlaceholder />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_VIEW",
        }),
      );
    });

    unmount();

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_EXIT",
        }),
      );
    });
  });

  it("tracks exit from return button click handler", async () => {
    render(<SubscriptionPlaceholder />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("link", { name: "Вернуться к тренажёру" }));

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "SUBSCRIPTION_PAGE_EXIT",
        }),
      );
    });
  });

  it("skips tracking without session id", async () => {
    searchParams = new URLSearchParams();

    render(<SubscriptionPlaceholder />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
    });
  });
});
