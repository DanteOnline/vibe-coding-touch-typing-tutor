"use client";

import { AnalyticsEventType } from "@prisma/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

export function SubscriptionPlaceholder() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sid");
  const startedAtRef = useRef(Date.now());
  const exitSentRef = useRef(false);

  const sendExitEvent = useCallback(async () => {
    if (!sessionId || exitSentRef.current) {
      return;
    }

    exitSentRef.current = true;
    const durationMs = Date.now() - startedAtRef.current;

    try {
      await trackAnalyticsEvent({
        eventType: AnalyticsEventType.SUBSCRIPTION_PAGE_EXIT,
        sessionId,
        durationMs,
      });
    } catch {
      exitSentRef.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    trackAnalyticsEvent({
      eventType: AnalyticsEventType.SUBSCRIPTION_PAGE_VIEW,
      sessionId,
    }).catch(() => {
      // Ignore analytics failures for UX.
    });
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void sendExitEvent();
      }
    };

    window.addEventListener("beforeunload", sendExitEvent);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", sendExitEvent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void sendExitEvent();
    };
  }, [sendExitEvent, sessionId]);

  const handleReturnClick = () => {
    void sendExitEvent();
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Раздел в разработке</CardTitle>
        <CardDescription>
          Подписка скоро появится. Спасибо за интерес к продукту.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild onClick={handleReturnClick}>
          <Link href="/trainer">Вернуться к тренажёру</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
