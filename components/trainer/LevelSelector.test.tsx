import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LevelSelector } from "@/components/trainer/LevelSelector";

describe("LevelSelector", () => {
  it("renders current level and characters", () => {
    render(
      <LevelSelector
        alphabet="jfk"
        currentLevel={2}
        maxLevel={3}
        onLevelChange={vi.fn()}
      />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/Символы: j f/)).toBeInTheDocument();
  });

  it("calls onLevelChange when navigating levels", async () => {
    const user = userEvent.setup();
    const onLevelChange = vi.fn();

    render(
      <LevelSelector
        alphabet="jfk"
        currentLevel={2}
        maxLevel={3}
        onLevelChange={onLevelChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "← Назад" }));
    await user.click(screen.getByRole("button", { name: "Вперёд →" }));

    expect(onLevelChange).toHaveBeenCalledWith(1);
    expect(onLevelChange).toHaveBeenCalledWith(3);
  });

  it("disables navigation at boundaries", () => {
    render(
      <LevelSelector
        alphabet="j"
        currentLevel={1}
        maxLevel={1}
        onLevelChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "← Назад" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Вперёд →" })).toBeDisabled();
  });
});
