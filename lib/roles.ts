import { Role } from "@prisma/client";

export function resolveRoleForEmail(email: string): Role {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && email.trim().toLowerCase() === adminEmail) {
    return Role.ADMIN;
  }
  return Role.USER;
}

export async function syncUserRole(userId: string, email: string) {
  const { db } = await import("@/lib/db");
  const role = resolveRoleForEmail(email);

  return db.user.update({
    where: { id: userId },
    data: { role },
    select: { role: true },
  });
}

export async function getSyncedUserRole(userId: string, email: string): Promise<Role> {
  const { db } = await import("@/lib/db");
  const expectedRole = resolveRoleForEmail(email);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return Role.USER;
  }

  if (user.role !== expectedRole) {
    const updated = await syncUserRole(userId, email);
    return updated.role;
  }

  return user.role;
}
