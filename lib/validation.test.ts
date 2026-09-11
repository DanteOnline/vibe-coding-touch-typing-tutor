import { describe, expect, it } from "vitest";

import {
  analyticsEventSchema,
  metricsQuerySchema,
  patchSchema,
  registerSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("validates register payload", () => {
    expect(
      registerSchema.safeParse({
        email: "test@example.com",
        password: "secret123",
      }).success,
    ).toBe(true);
  });

  it("validates progress payload", () => {
    expect(
      patchSchema.safeParse({
        currentLevel: 2,
        markCourseCompleted: true,
      }).success,
    ).toBe(true);
  });

  it("validates analytics event payload", () => {
    expect(
      analyticsEventSchema.safeParse({
        eventType: "TRAINER_IMPRESSION",
        sessionId: "00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid analytics session id", () => {
    expect(
      analyticsEventSchema.safeParse({
        eventType: "SUBSCRIPTION_CLICK",
        sessionId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("validates metrics query payload", () => {
    expect(metricsQuerySchema.safeParse({ days: "30" }).success).toBe(true);
  });
});
