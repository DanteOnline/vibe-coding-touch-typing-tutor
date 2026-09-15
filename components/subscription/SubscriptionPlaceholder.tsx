"use client";

import { AnalyticsEventType } from "@prisma/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { landingCopy } from "@/config/landing";
import {
  createAnalyticsSessionId,
  trackAnalyticsEvent,
} from "@/lib/analytics-client";

type SubscriptionPlaceholderProps = {
  isOnWaitlist: boolean;
};

export function SubscriptionPlaceholder({
  isOnWaitlist: initialIsOnWaitlist,
}: SubscriptionPlaceholderProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sid");
  const startedAtRef = useRef(Date.now());
  const exitSentRef = useRef(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(initialIsOnWaitlist);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleJoinWaitlist = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId ?? createAnalyticsSessionId(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Не удалось встать в waitlist");
        return;
      }

      setIsOnWaitlist(true);
    } catch {
      setError("Не удалось встать в waitlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{landingCopy.subscription.title}</CardTitle>
        <CardDescription>{landingCopy.subscription.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOnWaitlist ? (
          <>
            <p className="text-sm text-muted-foreground">
              {landingCopy.subscription.joinedNote}
            </p>
            <Button asChild onClick={handleReturnClick}>
              <Link href="/trainer">{landingCopy.subscription.continueCta}</Link>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => void handleJoinWaitlist()} disabled={loading}>
              {loading
                ? "Добавляем..."
                : landingCopy.subscription.joinCta}
            </Button>
            <Button asChild variant="outline" onClick={handleReturnClick}>
              <Link href="/trainer">{landingCopy.subscription.continueCta}</Link>
            </Button>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
