import { describe, expect, it } from "vitest";

import {
  getPrimaryCtaHref,
  getPrimaryCtaLabel,
  getSecondaryCtaHref,
} from "@/lib/landing-cta";

describe("landing cta helpers", () => {
  it("returns register with intent for guests", () => {
    expect(
      getPrimaryCtaHref({ isAuthenticated: false, isOnWaitlist: false }),
    ).toBe("/register?intent=full-access");
  });

  it("returns subscription for authenticated users", () => {
    expect(
      getPrimaryCtaHref({ isAuthenticated: true, isOnWaitlist: false }),
    ).toBe("/subscription");
  });

  it("returns trainer for waitlist users", () => {
    expect(getPrimaryCtaHref({ isAuthenticated: true, isOnWaitlist: true })).toBe(
      "/trainer",
    );
    expect(
      getPrimaryCtaLabel({ isAuthenticated: true, isOnWaitlist: true }),
    ).toBe("Продолжить обучение");
  });

  it("returns secondary href", () => {
    expect(getSecondaryCtaHref(false)).toBe("/register");
    expect(getSecondaryCtaHref(true)).toBe("/trainer");
  });
});
