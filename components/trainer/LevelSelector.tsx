"use client";

import { Button } from "@/components/ui/button";
import { getLevelCharacters } from "@/lib/levels";

type LevelSelectorProps = {
  alphabet: string;
  currentLevel: number;
  maxLevel: number;
  onLevelChange: (level: number) => void;
};

export function LevelSelector({
  alphabet,
  currentLevel,
  maxLevel,
  onLevelChange,
}: LevelSelectorProps) {
  const characters = getLevelCharacters(alphabet, currentLevel);

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Текущий уровень</p>
        <p className="text-2xl font-semibold">
          {currentLevel} <span className="text-base font-normal text-muted-foreground">/ {maxLevel}</span>
        </p>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          Символы: {characters.split("").join(" ")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => onLevelChange(currentLevel - 1)}
          disabled={currentLevel <= 1}
        >
          ← Назад
        </Button>
        <Button
          variant="outline"
          onClick={() => onLevelChange(currentLevel + 1)}
          disabled={currentLevel >= maxLevel}
        >
          Вперёд →
        </Button>
      </div>
    </div>
  );
}
