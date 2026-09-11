import { describe, expect, it } from "vitest";

import { trainerConfig } from "@/config/trainer";

describe("trainerConfig", () => {
  it("exports expected defaults", () => {
    expect(trainerConfig).toEqual({
      maxExerciseLength: 50,
      minTokenLength: 1,
      maxTokenLength: 4,
    });
  });
});
