import { AnalyticsEventType } from "@prisma/client";

import { db } from "@/lib/db";

export async function joinWaitlist(userId: string, sessionId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { waitlistJoinedAt: true },
  });

  if (!user) {
    return null;
  }

  if (user.waitlistJoinedAt) {
    return user;
  }

  const [updatedUser] = await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { waitlistJoinedAt: new Date() },
      select: { waitlistJoinedAt: true },
    }),
    db.analyticsEvent.create({
      data: {
        userId,
        sessionId,
        eventType: AnalyticsEventType.WAITLIST_JOIN,
      },
    }),
  ]);

  return updatedUser;
}
