import { AnalyticsEventType } from "@prisma/client";

type TrackEventInput = {
  eventType: AnalyticsEventType;
  sessionId: string;
  durationMs?: number;
};

export async function trackAnalyticsEvent(input: TrackEventInput) {
  const response = await fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to track analytics event");
  }

  return response.json();
}

export function createAnalyticsSessionId() {
  return crypto.randomUUID();
}
