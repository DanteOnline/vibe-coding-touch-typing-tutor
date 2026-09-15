import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  createAnalyticsSessionId: vi.fn(() => "00000000-0000-4000-8000-000000000099"),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe("SubscriptionPlaceholder", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams(
      "sid=00000000-0000-4000-8000-000000000001",
    );
    mockTrackAnalyticsEvent.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, waitlistJoinedAt: new Date().toISOString() }),
      }),
    );
  });

  it("renders waitlist content", () => {
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    expect(screen.getByText("Полный доступ — скоро")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Встать в waitlist" }),
    ).toBeInTheDocument();
  });

  it("renders joined waitlist state", () => {
    render(<SubscriptionPlaceholder isOnWaitlist={true} />);

    expect(
      screen.getByRole("link", { name: "Продолжить обучение" }),
    ).toBeInTheDocument();
  });

  it("tracks page view and exit on unmount", async () => {
    const { unmount } = render(<SubscriptionPlaceholder isOnWaitlist={false} />);

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

  it("joins waitlist", async () => {
    const user = userEvent.setup();
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await user.click(screen.getByRole("button", { name: "Встать в waitlist" }));

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Продолжить обучение" }),
      ).toBeInTheDocument();
    });
  });

  it("shows error when waitlist request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Ошибка" }),
      }),
    );

    const user = userEvent.setup();
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await user.click(screen.getByRole("button", { name: "Встать в waitlist" }));

    await waitFor(() => {
      expect(screen.getByText("Ошибка")).toBeInTheDocument();
    });
  });

  it("tracks exit from return button click handler", async () => {
    render(<SubscriptionPlaceholder isOnWaitlist={true} />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("link", { name: "Продолжить обучение" }));

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

    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
    });
  });

  it("tracks exit on visibility change", async () => {
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalled();
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

  it("retries exit tracking after analytics failure", async () => {
    mockTrackAnalyticsEvent
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error("exit failed"))
      .mockResolvedValueOnce({ success: true });

    const { unmount } = render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalled();
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

  it("shows fallback error when waitlist request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const user = userEvent.setup();
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await user.click(screen.getByRole("button", { name: "Встать в waitlist" }));

    await waitFor(() => {
      expect(screen.getByText("Не удалось встать в waitlist")).toBeInTheDocument();
    });
  });

  it("joins waitlist without session id in query", async () => {
    searchParams = new URLSearchParams();
    const user = userEvent.setup();
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await user.click(screen.getByRole("button", { name: "Встать в waitlist" }));

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Продолжить обучение" }),
      ).toBeInTheDocument();
    });
  });

  it("shows fallback error when waitlist response has no message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    );

    const user = userEvent.setup();
    render(<SubscriptionPlaceholder isOnWaitlist={false} />);

    await user.click(screen.getByRole("button", { name: "Встать в waitlist" }));

    await waitFor(() => {
      expect(screen.getByText("Не удалось встать в waitlist")).toBeInTheDocument();
    });
  });
});
