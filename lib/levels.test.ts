import { describe, expect, it } from "vitest";

import { clampLevel, getLevelCharacters } from "@/lib/levels";

describe("levels", () => {
  const alphabet = "jfkd";

  it("returns characters for a valid level", () => {
    expect(getLevelCharacters(alphabet, 1)).toBe("j");
    expect(getLevelCharacters(alphabet, 3)).toBe("jfk");
  });

  it("throws for invalid level", () => {
    expect(() => getLevelCharacters(alphabet, 0)).toThrow(RangeError);
    expect(() => getLevelCharacters(alphabet, 10)).toThrow(RangeError);
  });

  it("clamps level between 1 and maxLevel", () => {
    expect(clampLevel(0, 5)).toBe(1);
    expect(clampLevel(3, 5)).toBe(3);
    expect(clampLevel(10, 5)).toBe(5);
  });
});
