"use client";

import { AnalyticsEventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { landingCopy } from "@/config/landing";
import {
  createAnalyticsSessionId,
  trackAnalyticsEvent,
} from "@/lib/analytics-client";

const IMPRESSION_SENT_KEY = "trainer_impression_sent";
const VISIT_SESSION_KEY = "trainer_visit_session_id";

function getVisitSessionId() {
  const existing = sessionStorage.getItem(VISIT_SESSION_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = createAnalyticsSessionId();
  sessionStorage.setItem(VISIT_SESSION_KEY, sessionId);
  return sessionId;
}

export function SubscribeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(IMPRESSION_SENT_KEY)) {
      return;
    }

    const sessionId = getVisitSessionId();

    trackAnalyticsEvent({
      eventType: AnalyticsEventType.TRAINER_IMPRESSION,
      sessionId,
    })
      .then(() => {
        sessionStorage.setItem(IMPRESSION_SENT_KEY, "1");
      })
      .catch(() => {
        // Ignore analytics failures for UX.
      });
  }, []);

  const handleClick = async () => {
    setLoading(true);
    const sessionId = createAnalyticsSessionId();

    try {
      await trackAnalyticsEvent({
        eventType: AnalyticsEventType.SUBSCRIPTION_CLICK,
        sessionId,
      });
      router.push(`/subscription?sid=${sessionId}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Переход..." : landingCopy.subscribe.button}
      </Button>
      <p className="max-w-xs text-xs text-muted-foreground">
        {landingCopy.subscribe.subtitle}
      </p>
    </div>
  );
}
