import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionProvider } from "@/components/providers/SessionProvider";

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe("SessionProvider", () => {
  it("wraps children with next-auth provider", () => {
    render(
      <SessionProvider>
        <span>child</span>
      </SessionProvider>,
    );

    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
