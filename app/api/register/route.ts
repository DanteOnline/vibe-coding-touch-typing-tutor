import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Некорректные данные" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    await db.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось зарегистрироваться" },
      { status: 500 },
    );
  }
}
