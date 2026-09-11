import { NextResponse } from "next/server";

import { getMaxLevel, loadAlphabet } from "@/lib/alphabet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clampLevel } from "@/lib/levels";
import { patchSchema } from "@/lib/validation";

async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alphabet = loadAlphabet();
  const maxLevel = getMaxLevel(alphabet);
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      currentLevel: true,
      courseCompletedAt: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    currentLevel: clampLevel(dbUser.currentLevel, maxLevel),
    courseCompletedAt: dbUser.courseCompletedAt,
    maxLevel,
  });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const alphabet = loadAlphabet();
    const maxLevel = getMaxLevel(alphabet);
    const currentLevel = clampLevel(parsed.data.currentLevel, maxLevel);

    const existingUser = await db.user.findUnique({
      where: { id: user.id },
      select: { courseCompletedAt: true },
    });

    const updateData: {
      currentLevel: number;
      courseCompletedAt?: Date;
    } = { currentLevel };

    if (
      parsed.data.markCourseCompleted &&
      currentLevel === maxLevel &&
      !existingUser?.courseCompletedAt
    ) {
      updateData.courseCompletedAt = new Date();
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        currentLevel: true,
        courseCompletedAt: true,
      },
    });

    return NextResponse.json({
      currentLevel: updated.currentLevel,
      courseCompletedAt: updated.courseCompletedAt,
      maxLevel,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}
