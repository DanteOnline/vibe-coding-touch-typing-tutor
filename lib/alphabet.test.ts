import { readFileSync } from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getMaxLevel, loadAlphabet } from "@/lib/alphabet";

vi.mock("fs");

describe("alphabet", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads alphabet from file", () => {
    vi.mocked(readFileSync).mockReturnValue("  jfk  \n");

    expect(loadAlphabet()).toBe("jfk");
  });

  it("throws when alphabet file is empty", () => {
    vi.mocked(readFileSync).mockReturnValue("   ");

    expect(() => loadAlphabet()).toThrow("Alphabet file is empty");
  });

  it("returns max level as alphabet length", () => {
    expect(getMaxLevel("jfk")).toBe(3);
  });
});
