import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FunnelMetricsPanel } from "@/components/admin/FunnelMetricsPanel";

describe("FunnelMetricsPanel", () => {
  it("renders funnel metrics", () => {
    render(
      <FunnelMetricsPanel
        funnel={{
          landingCtaClicks: 10,
          registrations: 5,
          trainerImpressions: 8,
          subscriptionClicks: 2,
          waitlistJoins: 1,
          landingToRegisterRate: 50,
          registerToTrainerRate: 160,
          trainerToClickRate: 25,
        }}
      />,
    );

    expect(screen.getByText("Воронка лендинга")).toBeInTheDocument();
    expect(screen.getByText("Landing → Register")).toBeInTheDocument();
  });
});
