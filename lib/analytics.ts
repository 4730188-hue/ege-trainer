import { db } from "@/lib/db";

export type AnalyticsEventName =
  | "main_bot_start"
  | "support_message"
  | "payment_create"
  | "payment_succeeded"
  | "subscription_check"
  | "paywall_view"
  | "paywall_payment_click";

export async function ensureAnalyticsTable() {
  await db.query(`
    create table if not exists bot_events (
      id bigserial primary key,
      event_name text not null,
      user_id text,
      telegram_id text,
      telegram_username text,
      telegram_first_name text,
      telegram_last_name text,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    );

    create index if not exists bot_events_event_name_idx
      on bot_events(event_name);

    create index if not exists bot_events_created_at_idx
      on bot_events(created_at);

    create index if not exists bot_events_user_id_idx
      on bot_events(user_id);
  `);
}

export async function trackEvent(params: {
  eventName: AnalyticsEventName | string;
  userId?: string | null;
  telegramId?: string | null;
  telegramUsername?: string | null;
  telegramFirstName?: string | null;
  telegramLastName?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await ensureAnalyticsTable();

    await db.query(
      `
        insert into bot_events (
          event_name,
          user_id,
          telegram_id,
          telegram_username,
          telegram_first_name,
          telegram_last_name,
          metadata
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb)
      `,
      [
        params.eventName,
        params.userId || null,
        params.telegramId || null,
        params.telegramUsername || null,
        params.telegramFirstName || null,
        params.telegramLastName || null,
        JSON.stringify(params.metadata || {}),
      ]
    );
  } catch (error) {
    console.error("Analytics track error:", error);
  }
}
