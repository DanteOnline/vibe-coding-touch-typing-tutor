import { afterEach, describe, expect, it, vi } from "vitest";

import { generateExercise } from "@/lib/exercise-generator";

describe("generateExercise", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty string for empty characters", () => {
    expect(generateExercise("")).toBe("");
  });

  it("generates exercise within max length", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);

    const exercise = generateExercise("jfk");

    expect(exercise.length).toBeLessThanOrEqual(50);
    expect(exercise.split(" ").every((token) => /^[jfk]+$/.test(token))).toBe(
      true,
    );
  });

  it("falls back to sliced token when first token exceeds max length", async () => {
    vi.resetModules();
    vi.doMock("@/config/trainer", () => ({
      trainerConfig: {
        maxExerciseLength: 1,
        minTokenLength: 2,
        maxTokenLength: 4,
      },
    }));

    vi.spyOn(Math, "random").mockReturnValue(0.99);

    const { generateExercise: generateShortExercise } = await import(
      "@/lib/exercise-generator"
    );

    expect(generateShortExercise("jfk").length).toBeLessThanOrEqual(1);
  });
});
