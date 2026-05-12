import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE_NAME = "ege_trainer_session";

export type AuthUser = {
  id: string;
  email: string;
};

export async function ensureAuthTables() {
  await db.query(`
    create table if not exists web_users (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      password_hash text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists web_user_sessions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references web_users(id) on delete cascade,
      token text not null unique,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    );

    create index if not exists web_user_sessions_token_idx
      on web_user_sessions(token);

    create index if not exists web_user_sessions_user_id_idx
      on web_user_sessions(user_id);
  `);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) return false;

  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");

  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

export async function createSession(userId: string) {
  await ensureAuthTables();

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.query(
    `
      insert into web_user_sessions (user_id, token, expires_at)
      values ($1, $2, $3)
    `,
    [userId, token, expiresAt.toISOString()]
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  await ensureAuthTables();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const result = await db.query(
    `
      select web_users.id::text as id, web_users.email
      from web_user_sessions
      join web_users on web_users.id = web_user_sessions.user_id
      where web_user_sessions.token = $1
        and web_user_sessions.expires_at > now()
      limit 1
    `,
    [token]
  );

  return result.rows[0] || null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.query(`delete from web_user_sessions where token = $1`, [token]);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
