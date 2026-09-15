import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getInvestorContactEmail,
  getInvestorMailtoLink,
  investorsCopy,
} from "@/config/investors";

describe("investors config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defines investor sections", () => {
    expect(investorsCopy.traction.metrics.length).toBeGreaterThan(0);
    expect(investorsCopy.useOfFunds.items.length).toBe(3);
  });

  it("builds mailto link from env", () => {
    vi.stubEnv("INVESTOR_CONTACT_EMAIL", "fund@example.com");

    expect(getInvestorContactEmail()).toBe("fund@example.com");
    expect(getInvestorMailtoLink()).toContain("mailto:fund@example.com");
  });

  it("uses default contact email without env", () => {
    vi.unstubAllEnvs();

    expect(getInvestorContactEmail()).toBe("investors@example.com");
  });
});
