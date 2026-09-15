import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Touch Typing Tutor</p>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground">
            Главная
          </Link>
          <Link href="/investors" className="hover:text-foreground">
            Для инвесторов
          </Link>
        </nav>
      </div>
    </footer>
  );
}
