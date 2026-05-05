import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getYooKassaPayment } from "@/lib/yookassa";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type !== "notification" || body.event !== "payment.succeeded") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.object?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const payment = await getYooKassaPayment(paymentId);

    if (payment.status !== "succeeded" || payment.paid !== true) {
      return NextResponse.json({ ok: true });
    }

    const userId = String(payment.metadata?.userId || "").trim();
    const plan = String(payment.metadata?.plan || "monthly");
    const days = Number(payment.metadata?.days || 30);
    const telegramId = String(payment.metadata?.telegramId || "").trim() || null;
    const telegramUsername = String(payment.metadata?.telegramUsername || "").trim() || null;
    const telegramFirstName = String(payment.metadata?.telegramFirstName || "").trim() || null;
    const telegramLastName = String(payment.metadata?.telegramLastName || "").trim() || null;

    if (!userId) {
      console.error("YooKassa payment without userId metadata", paymentId);
      return NextResponse.json({ ok: true });
    }

    await db.query(`
      alter table payments add column if not exists telegram_id text;
      alter table payments add column if not exists telegram_username text;
      alter table payments add column if not exists telegram_first_name text;
      alter table payments add column if not exists telegram_last_name text;
      alter table subscriptions add column if not exists telegram_id text;
      alter table subscriptions add column if not exists telegram_username text;
      alter table subscriptions add column if not exists telegram_first_name text;
      alter table subscriptions add column if not exists telegram_last_name text;
    `);

    await db.query("begin");

    try {
      await db.query(
        `
          update payments
          set status = 'succeeded',
              paid_at = now(),
              telegram_id = coalesce($2, telegram_id),
              telegram_username = coalesce($3, telegram_username),
              telegram_first_name = coalesce($4, telegram_first_name),
              telegram_last_name = coalesce($5, telegram_last_name)
          where yookassa_payment_id = $1
        `,
        [paymentId, telegramId, telegramUsername, telegramFirstName, telegramLastName]
      );

      await db.query(
        `
          insert into subscriptions (
            user_id,
            plan,
            active,
            starts_at,
            expires_at,
            updated_at,
            telegram_id,
            telegram_username,
            telegram_first_name,
            telegram_last_name
          )
          values ($1, $2, true, now(), now() + ($3 || ' days')::interval, now(), $4, $5, $6, $7)
          on conflict (user_id)
          do update set
            plan = excluded.plan,
            active = true,
            expires_at = case
              when subscriptions.expires_at > now()
              then subscriptions.expires_at + ($3 || ' days')::interval
              else now() + ($3 || ' days')::interval
            end,
            updated_at = now(),
            telegram_id = coalesce(excluded.telegram_id, subscriptions.telegram_id),
            telegram_username = coalesce(excluded.telegram_username, subscriptions.telegram_username),
            telegram_first_name = coalesce(excluded.telegram_first_name, subscriptions.telegram_first_name),
            telegram_last_name = coalesce(excluded.telegram_last_name, subscriptions.telegram_last_name)
        `,
        [userId, plan, days, telegramId, telegramUsername, telegramFirstName, telegramLastName]
      );

      await db.query("commit");
    } catch (error) {
      await db.query("rollback");
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("YooKassa webhook error", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
