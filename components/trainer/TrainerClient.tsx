"use client";

import { useCallback, useState } from "react";

import { CourseComplete } from "@/components/trainer/CourseComplete";
import { LevelSelector } from "@/components/trainer/LevelSelector";
import { TypingExercise } from "@/components/trainer/TypingExercise";

type TrainerClientProps = {
  alphabet: string;
  initialLevel: number;
  maxLevel: number;
  initialCourseCompleted: boolean;
};

export function TrainerClient({
  alphabet,
  initialLevel,
  maxLevel,
  initialCourseCompleted,
}: TrainerClientProps) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [courseCompleted, setCourseCompleted] = useState(initialCourseCompleted);

  const saveProgress = useCallback(
    async (level: number, markCourseCompleted = false) => {
      const response = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLevel: level,
          markCourseCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save progress");
      }

      const data = await response.json();
      setCurrentLevel(data.currentLevel);
      if (data.courseCompletedAt) {
        setCourseCompleted(true);
      }
    },
    [],
  );

  const handleLevelChange = async (level: number) => {
    if (level < 1 || level > maxLevel) {
      return;
    }
    await saveProgress(level);
  };

  return (
    <div className="space-y-6">
      {courseCompleted && <CourseComplete />}
      <LevelSelector
        alphabet={alphabet}
        currentLevel={currentLevel}
        maxLevel={maxLevel}
        onLevelChange={handleLevelChange}
      />
      <TypingExercise
        alphabet={alphabet}
        currentLevel={currentLevel}
        maxLevel={maxLevel}
        courseCompleted={courseCompleted}
        onLevelAdvance={saveProgress}
        onCourseCompleted={() => setCourseCompleted(true)}
      />
    </div>
  );
}
