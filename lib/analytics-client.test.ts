import { AnalyticsEventType } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAnalyticsSessionId,
  trackAnalyticsEvent,
} from "@/lib/analytics-client";

describe("analytics-client", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );
  });

  it("creates uuid session id", () => {
    expect(createAnalyticsSessionId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("tracks analytics event", async () => {
    await trackAnalyticsEvent({
      eventType: AnalyticsEventType.TRAINER_IMPRESSION,
      sessionId: createAnalyticsSessionId(),
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/analytics/events",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws when tracking fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(
      trackAnalyticsEvent({
        eventType: AnalyticsEventType.TRAINER_IMPRESSION,
        sessionId: createAnalyticsSessionId(),
      }),
    ).rejects.toThrow("Failed to track analytics event");
  });
});
