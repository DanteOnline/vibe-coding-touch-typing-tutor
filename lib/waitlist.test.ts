import { beforeEach, describe, expect, it, vi } from "vitest";

import { joinWaitlist } from "@/lib/waitlist";

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    analyticsEvent: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

describe("waitlist", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
    mockCreate.mockReset();
    mockTransaction.mockReset();
  });

  it("returns null for missing user", async () => {
    mockFindUnique.mockResolvedValue(null);

    expect(await joinWaitlist("missing", "00000000-0000-4000-8000-000000000001")).toBeNull();
  });

  it("returns existing waitlist user without transaction", async () => {
    mockFindUnique.mockResolvedValue({
      waitlistJoinedAt: new Date("2026-01-01"),
    });

    const result = await joinWaitlist(
      "user-1",
      "00000000-0000-4000-8000-000000000001",
    );

    expect(result?.waitlistJoinedAt).toBeTruthy();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("joins waitlist and tracks analytics event", async () => {
    mockFindUnique.mockResolvedValue({ waitlistJoinedAt: null });
    mockTransaction.mockResolvedValue([
      { waitlistJoinedAt: new Date("2026-02-01") },
      { id: "event-1" },
    ]);

    const result = await joinWaitlist(
      "user-1",
      "00000000-0000-4000-8000-000000000001",
    );

    expect(result?.waitlistJoinedAt).toBeTruthy();
    expect(mockTransaction).toHaveBeenCalled();
  });
});
