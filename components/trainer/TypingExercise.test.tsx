import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TypingExercise } from "@/components/trainer/TypingExercise";

vi.mock("@/lib/exercise-generator", () => ({
  generateExercise: vi.fn(() => "jj"),
}));

describe("TypingExercise", () => {
  const onLevelAdvance = vi.fn().mockResolvedValue(undefined);
  const onCourseCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders exercise and accepts correct input", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "jj");

    expect(
      screen.getByText("Отлично! Упражнение выполнено без ошибок."),
    ).toBeInTheDocument();
  });

  it("resets input on error", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "x");

    expect(
      screen.getByText("Ошибка! Начните упражнение заново."),
    ).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(500);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("starts next exercise after success", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "jj");
    await user.click(screen.getByRole("button", { name: "Ещё упражнение" }));

    expect(
      screen.getByText("Печатайте символ за символом"),
    ).toBeInTheDocument();
  });

  it("advances to next level", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "jj");
    await user.click(screen.getByRole("button", { name: "Следующий уровень →" }));

    expect(onLevelAdvance).toHaveBeenCalledWith(2, false);
  });

  it("completes course on final level", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={3}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "jj");
    await user.click(screen.getByRole("button", { name: "Завершить курс" }));

    expect(onLevelAdvance).toHaveBeenCalledWith(3, true);
    expect(onCourseCompleted).toHaveBeenCalled();
  });

  it("ignores input after success", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "jj");
    await user.type(input, "x");

    expect(onLevelAdvance).not.toHaveBeenCalled();
  });

  it("ignores input longer than exercise", () => {
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    fireEvent.change(input, { target: { value: "jjj" } });

    expect(input).toHaveValue("");
  });

  it("hides complete course button when course is already completed", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={3}
        maxLevel={3}
        courseCompleted={true}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.type(input, "jj");

    expect(
      screen.queryByRole("button", { name: "Завершить курс" }),
    ).not.toBeInTheDocument();
  });

  it("focuses input when clicking card content", async () => {
    const user = userEvent.setup();
    render(
      <TypingExercise
        alphabet="jfk"
        currentLevel={1}
        maxLevel={3}
        courseCompleted={false}
        onLevelAdvance={onLevelAdvance}
        onCourseCompleted={onCourseCompleted}
      />,
    );

    const input = screen.getByLabelText("Поле ввода упражнения");
    await user.click(screen.getByText("Курсор здесь — начните печатать"));

    expect(input).toHaveFocus();
  });
});
