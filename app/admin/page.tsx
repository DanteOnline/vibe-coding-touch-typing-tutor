import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { MetricsDashboard } from "@/components/admin/MetricsDashboard";
import { auth } from "@/lib/auth";
import { getSyncedUserRole } from "@/lib/roles";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  const role = await getSyncedUserRole(session.user.id, session.user.email);

  if (role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Админка</h1>
        <p className="text-muted-foreground">
          Метрики fake door за последние 30 дней
        </p>
      </div>
      <MetricsDashboard />
    </div>
  );
}
