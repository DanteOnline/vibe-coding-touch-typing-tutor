import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function HomePage() {
  const session = await auth();
  let isOnWaitlist = false;

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { waitlistJoinedAt: true },
    });
    isOnWaitlist = Boolean(user?.waitlistJoinedAt);
  }

  return (
    <LandingPage
      isAuthenticated={Boolean(session?.user)}
      isOnWaitlist={isOnWaitlist}
    />
  );
}
