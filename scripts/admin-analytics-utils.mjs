import { randomInt } from "node:crypto";

export const BOUNCE_THRESHOLD_MS = 10_000;
export const DEFAULT_DAYS = 30;
export const OUTPUT_FILE = "admin_data.json";

export const EVENT_TYPES = {
  IMPRESSION: "TRAINER_IMPRESSION",
  CLICK: "SUBSCRIPTION_CLICK",
  VIEW: "SUBSCRIPTION_PAGE_VIEW",
  EXIT: "SUBSCRIPTION_PAGE_EXIT",
};

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function buildDateRange(days) {
  const today = startOfDay(new Date());
  const dates = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    dates.push(date);
  }

  return dates;
}

function calculateRate(numerator, denominator) {
  if (denominator === 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

export function randomTimeInDay(dayStart) {
  const date = new Date(dayStart);
  date.setHours(
    randomInt(8, 22),
    randomInt(0, 59),
    randomInt(0, 59),
    randomInt(0, 999),
  );
  return date;
}

export function generateDayEvents(userId, dayStart) {
  const events = [];
  const impressions = randomInt(25, 140);
  const clicks = randomInt(
    Math.max(1, Math.floor(impressions * 0.04)),
    Math.max(2, Math.floor(impressions * 0.35)),
  );

  for (let index = 0; index < impressions; index += 1) {
    events.push({
      userId,
      sessionId: crypto.randomUUID(),
      eventType: EVENT_TYPES.IMPRESSION,
      durationMs: null,
      createdAt: randomTimeInDay(dayStart),
    });
  }

  for (let index = 0; index < clicks; index += 1) {
    const sessionId = crypto.randomUUID();
    const clickAt = randomTimeInDay(dayStart);
    const viewAt = new Date(clickAt.getTime() + randomInt(100, 2_000));
    const durationMs = randomInt(800, 45_000);
    const exitAt = new Date(viewAt.getTime() + durationMs);

    events.push({
      userId,
      sessionId,
      eventType: EVENT_TYPES.CLICK,
      durationMs: null,
      createdAt: clickAt,
    });
    events.push({
      userId,
      sessionId,
      eventType: EVENT_TYPES.VIEW,
      durationMs: null,
      createdAt: viewAt,
    });
    events.push({
      userId,
      sessionId,
      eventType: EVENT_TYPES.EXIT,
      durationMs,
      createdAt: exitAt,
    });
  }

  return events.sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );
}

export function generateAnalyticsEvents(userId, days = DEFAULT_DAYS) {
  return buildDateRange(days).flatMap((day) =>
    generateDayEvents(userId, day),
  );
}

export function aggregateDailyMetrics(events, days = DEFAULT_DAYS) {
  const eventsByDay = new Map();

  for (const event of events) {
    const key = formatDateKey(event.createdAt);
    const bucket = eventsByDay.get(key) ?? [];
    bucket.push(event);
    eventsByDay.set(key, bucket);
  }

  return buildDateRange(days).map((date) => {
    const key = formatDateKey(date);
    const dayEvents = eventsByDay.get(key) ?? [];

    const impressions = dayEvents.filter(
      (event) => event.eventType === EVENT_TYPES.IMPRESSION,
    ).length;
    const clicks = dayEvents.filter(
      (event) => event.eventType === EVENT_TYPES.CLICK,
    ).length;
    const clickedSessionIds = new Set(
      dayEvents
        .filter((event) => event.eventType === EVENT_TYPES.CLICK)
        .map((event) => event.sessionId),
    );
    const bounces = dayEvents.filter(
      (event) =>
        event.eventType === EVENT_TYPES.EXIT &&
        clickedSessionIds.has(event.sessionId) &&
        (event.durationMs ?? Number.MAX_SAFE_INTEGER) < BOUNCE_THRESHOLD_MS,
    ).length;

    return {
      date: key,
      impressions,
      clicks,
      ctr: calculateRate(clicks, impressions),
      bounces,
      bounceRate: calculateRate(bounces, clicks),
    };
  });
}

export function serializeEvents(events) {
  return events.map((event) => ({
    userId: event.userId,
    sessionId: event.sessionId,
    eventType: event.eventType,
    durationMs: event.durationMs,
    createdAt: event.createdAt.toISOString(),
  }));
}

export function buildAdminDataPayload(events, days = DEFAULT_DAYS) {
  return {
    generatedAt: new Date().toISOString(),
    days,
    events: serializeEvents(events),
    daily: aggregateDailyMetrics(events, days),
  };
}
