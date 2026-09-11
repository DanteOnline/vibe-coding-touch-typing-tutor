"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateExercise } from "@/lib/exercise-generator";
import { getLevelCharacters } from "@/lib/levels";
import { cn } from "@/lib/utils";

type TypingExerciseProps = {
  alphabet: string;
  currentLevel: number;
  maxLevel: number;
  courseCompleted: boolean;
  onLevelAdvance: (nextLevel: number, markCourseCompleted: boolean) => Promise<void>;
  onCourseCompleted: () => void;
};

type ExerciseStatus = "typing" | "success" | "error";

export function TypingExercise({
  alphabet,
  currentLevel,
  maxLevel,
  courseCompleted,
  onLevelAdvance,
  onCourseCompleted,
}: TypingExerciseProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [exercise, setExercise] = useState("");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ExerciseStatus>("typing");
  const [errorAnimation, setErrorAnimation] = useState(false);

  const regenerateExercise = useCallback(() => {
    const characters = getLevelCharacters(alphabet, currentLevel);
    setExercise(generateExercise(characters));
    setInput("");
    setStatus("typing");
  }, [alphabet, currentLevel]);

  useEffect(() => {
    regenerateExercise();
  }, [regenerateExercise]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [exercise, status]);

  const handleInputChange = (value: string) => {
    if (status !== "typing") {
      return;
    }

    const nextChar = value.slice(-1);
    const expectedChar = exercise[value.length - 1];

    if (value.length > exercise.length) {
      return;
    }

    if (nextChar !== expectedChar) {
      setErrorAnimation(true);
      setStatus("error");
      setInput("");
      window.setTimeout(() => {
        setErrorAnimation(false);
        setStatus("typing");
        inputRef.current?.focus();
      }, 500);
      return;
    }

    setInput(value);

    if (value.length === exercise.length) {
      setStatus("success");
    }
  };

  const handleNextExercise = () => {
    regenerateExercise();
  };

  const handleAdvanceLevel = async () => {
    if (currentLevel >= maxLevel) {
      await onLevelAdvance(currentLevel, true);
      onCourseCompleted();
      regenerateExercise();
      return;
    }

    const nextLevel = currentLevel + 1;
    await onLevelAdvance(nextLevel, false);
    regenerateExercise();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Задание</CardTitle>
          <CardDescription>Напечатайте текст точно как показано</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="min-h-24 break-all font-mono text-lg leading-relaxed">
            {exercise.split("").map((char, index) => {
              let className = "text-muted-foreground";
              if (index < input.length) {
                className = "text-green-600 dark:text-green-400";
              } else if (index === input.length) {
                className = "rounded bg-primary/15 text-primary underline decoration-2 underline-offset-4";
              }
              return (
                <span key={`${char}-${index}`} className={className}>
                  {char}
                </span>
              );
            })}
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          errorAnimation && "animate-shake animate-flash-error",
          status === "success" && "border-green-500/50 bg-green-500/5",
        )}
      >
        <CardHeader>
          <CardTitle>Ваш ввод</CardTitle>
          <CardDescription>
            {status === "error"
              ? "Ошибка! Начните упражнение заново."
              : status === "success"
                ? "Отлично! Упражнение выполнено без ошибок."
                : "Печатайте символ за символом"}
          </CardDescription>
        </CardHeader>
        <CardContent
          className="cursor-text space-y-4"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            className="sr-only"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Поле ввода упражнения"
          />
          <p className="min-h-24 break-all font-mono text-lg leading-relaxed">
            {input || (
              <span className="text-muted-foreground">
                Курсор здесь — начните печатать
              </span>
            )}
          </p>

          {status === "success" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleNextExercise} variant="outline">
                Ещё упражнение
              </Button>
              {currentLevel < maxLevel ? (
                <Button onClick={handleAdvanceLevel}>
                  Следующий уровень →
                </Button>
              ) : !courseCompleted ? (
                <Button onClick={handleAdvanceLevel}>Завершить курс</Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
