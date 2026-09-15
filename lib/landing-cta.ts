import { landingCta } from "@/config/landing";

type LandingCtaOptions = {
  isAuthenticated: boolean;
  isOnWaitlist: boolean;
};

export function getPrimaryCtaHref({
  isAuthenticated,
  isOnWaitlist,
}: LandingCtaOptions) {
  if (isAuthenticated) {
    return isOnWaitlist ? landingCta.trainerPath : landingCta.subscriptionPath;
  }

  return landingCta.registerWithIntent;
}

export function getPrimaryCtaLabel({
  isAuthenticated,
  isOnWaitlist,
}: LandingCtaOptions) {
  if (isAuthenticated && isOnWaitlist) {
    return "Продолжить обучение";
  }

  return "Разблокировать все уровни";
}

export function getSecondaryCtaHref(isAuthenticated: boolean) {
  return isAuthenticated ? landingCta.trainerPath : landingCta.registerPath;
}
