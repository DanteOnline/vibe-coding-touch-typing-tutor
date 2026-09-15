"use client";

import { AnalyticsEventType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  createAnalyticsSessionId,
  trackAnalyticsEvent,
} from "@/lib/analytics-client";

type LandingCtaButtonProps = {
  href: string;
  label: string;
  variant?: "default" | "outline";
  size?: "default" | "lg";
  trackClick?: boolean;
};

export function LandingCtaButton({
  href,
  label,
  variant = "default",
  size = "lg",
  trackClick = true,
}: LandingCtaButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (trackClick) {
      try {
        await trackAnalyticsEvent({
          eventType: AnalyticsEventType.LANDING_CTA_CLICK,
          sessionId: createAnalyticsSessionId(),
        });
      } catch {
        // Ignore analytics failures for UX.
      }
    }

    router.push(href);
  };

  if (!trackClick) {
    return (
      <Button asChild variant={variant} size={size}>
        <Link href={href}>{label}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} onClick={() => void handleClick()}>
      {label}
    </Button>
  );
}
