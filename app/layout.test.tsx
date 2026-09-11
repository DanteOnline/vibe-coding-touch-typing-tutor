import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RootLayout, { metadata } from "@/app/layout";

vi.mock("@/components/layout/Header", () => ({
  Header: () => <header>Header</header>,
}));

vi.mock("@/components/providers/SessionProvider", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("RootLayout", () => {
  it("exports metadata", () => {
    expect(metadata.title).toBe("Touch Typing Tutor");
  });

  it("renders layout with children", () => {
    render(
      <RootLayout>
        <div>Page content</div>
      </RootLayout>,
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
