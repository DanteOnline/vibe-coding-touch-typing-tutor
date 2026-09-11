import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { SessionProvider } from "@/components/providers/SessionProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Touch Typing Tutor",
  description: "Тренажёр слепой печати с поуровневым изучением алфавита",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
