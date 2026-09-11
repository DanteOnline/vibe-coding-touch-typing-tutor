import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Тренажёр слепой печати
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Изучайте алфавит постепенно — от одной буквы до полного набора символов.
          Прогресс сохраняется, а упражнения генерируются случайно для каждого уровня.
        </p>
        <div className="flex justify-center gap-3">
          {session?.user ? (
            <Button asChild size="lg">
              <Link href="/trainer">Перейти к тренажёру</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/register">Начать</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Войти</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Поуровневое обучение</CardTitle>
            <CardDescription>
              Каждый уровень добавляет новый символ к уже изученным.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Мгновенная обратная связь</CardTitle>
            <CardDescription>
              Ошибка сразу видна — упражнение сбрасывается, уровень сохраняется.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Сохранение прогресса</CardTitle>
            <CardDescription>
              После входа вы продолжаете с последнего сохранённого уровня.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </section>
    </div>
  );
}
