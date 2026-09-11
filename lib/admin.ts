import { Role } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function requireAdminUser() {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, role: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    return null;
  }

  return user;
}
