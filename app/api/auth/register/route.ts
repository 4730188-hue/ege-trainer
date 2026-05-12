import { NextRequest, NextResponse } from "next/server";
import { createSession, ensureAuthTables, hashPassword, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await ensureAuthTables();

    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const password = String(body.password || "");

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть минимум 6 символов" }, { status: 400 });
    }

    const existing = await db.query(`select id from web_users where email = $1 limit 1`, [email]);

    if (existing.rows[0]) {
      return NextResponse.json({ error: "Такой email уже зарегистрирован" }, { status: 409 });
    }

    const result = await db.query(
      `
        insert into web_users (email, password_hash)
        values ($1, $2)
        returning id::text, email
      `,
      [email, hashPassword(password)]
    );

    const user = result.rows[0];

    await createSession(user.id);

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ error: "Не удалось зарегистрироваться" }, { status: 500 });
  }
}
