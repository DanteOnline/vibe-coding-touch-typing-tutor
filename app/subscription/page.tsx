import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SubscriptionPlaceholder } from "@/components/subscription/SubscriptionPlaceholder";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { waitlistJoinedAt: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<div className="text-center">Загрузка...</div>}>
      <SubscriptionPlaceholder isOnWaitlist={Boolean(user.waitlistJoinedAt)} />
    </Suspense>
  );
}
