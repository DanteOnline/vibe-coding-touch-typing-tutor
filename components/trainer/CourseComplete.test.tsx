import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CourseComplete } from "@/components/trainer/CourseComplete";

describe("CourseComplete", () => {
  it("renders completion message", () => {
    render(<CourseComplete />);

    expect(screen.getByText("Курс завершён!")).toBeInTheDocument();
    expect(
      screen.getByText(/Вы успешно прошли все уровни/),
    ).toBeInTheDocument();
  });
});
