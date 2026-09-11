import { Role } from "@prisma/client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const session = await auth();
  let isAdmin = session?.user?.role === Role.ADMIN;

  if (session?.user?.id && !isAdmin) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    isAdmin = user?.role === Role.ADMIN;
  }

  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Touch Typing Tutor
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">Главная</Link>
          </Button>
          {session?.user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/trainer">Тренажёр</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" asChild>
                  <Link href="/admin">Админка</Link>
                </Button>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
