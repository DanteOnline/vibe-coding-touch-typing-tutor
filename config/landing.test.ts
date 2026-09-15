import { describe, expect, it } from "vitest";

import { landingCopy, landingCta } from "@/config/landing";

describe("landing config", () => {
  it("defines hero copy and cta paths", () => {
    expect(landingCopy.hero.primaryCta).toBe("Разблокировать все уровни");
    expect(landingCta.registerWithIntent).toContain("intent=full-access");
    expect(landingCopy.proof.testimonials.length).toBeGreaterThan(0);
  });
});
