import { TrainerClient } from "@/components/trainer/TrainerClient";
import { getMaxLevel, loadAlphabet } from "@/lib/alphabet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clampLevel } from "@/lib/levels";
import { redirect } from "next/navigation";

export default async function TrainerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const alphabet = loadAlphabet();
  const maxLevel = getMaxLevel(alphabet);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      currentLevel: true,
      courseCompletedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Тренажёр</h1>
        <p className="text-muted-foreground">
          Выберите уровень и выполните упражнение без ошибок
        </p>
      </div>
      <TrainerClient
        alphabet={alphabet}
        initialLevel={clampLevel(user.currentLevel, maxLevel)}
        maxLevel={maxLevel}
        initialCourseCompleted={!!user.courseCompletedAt}
      />
    </div>
  );
}
