import { AnalyticsEventType } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});

export const patchSchema = z.object({
  currentLevel: z.number().int().positive(),
  markCourseCompleted: z.boolean().optional(),
});

export const analyticsEventSchema = z.object({
  eventType: z.nativeEnum(AnalyticsEventType),
  sessionId: z.string().uuid(),
  durationMs: z.number().int().nonnegative().optional(),
});

export const metricsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(90).optional(),
});
