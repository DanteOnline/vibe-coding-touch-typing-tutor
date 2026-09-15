import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders investor link", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Для инвесторов" })).toHaveAttribute(
      "href",
      "/investors",
    );
  });
});
