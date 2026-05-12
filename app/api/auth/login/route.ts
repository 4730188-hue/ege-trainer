import { NextRequest, NextResponse } from "next/server";
import { createSession, ensureAuthTables, normalizeEmail, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await ensureAuthTables();

    const body = await request.json();
    const email = normalizeEmail(String(body.email || ""));
    const password = String(body.password || "");

    const result = await db.query(
      `
        select id::text, email, password_hash
        from web_users
        where email = $1
        limit 1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Не удалось войти" }, { status: 500 });
  }
}
