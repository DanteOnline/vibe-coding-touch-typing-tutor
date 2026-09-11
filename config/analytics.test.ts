import { describe, expect, it } from "vitest";

import { analyticsConfig } from "@/config/analytics";

describe("analyticsConfig", () => {
  it("exports analytics defaults", () => {
    expect(analyticsConfig).toEqual({
      bounceThresholdMs: 10_000,
      metricsDefaultDays: 30,
    });
  });
});
