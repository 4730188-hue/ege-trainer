import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createYooKassaPayment } from "@/lib/yookassa";
import { trackEvent } from "@/lib/analytics";

const plans = {
  monthly: {
    amount: "690.00",
    title: "EGE Trainer Pro на 1 месяц",
    days: 30,
  },
  quarterly: {
    amount: "1490.00",
    title: "EGE Trainer Pro на 3 месяца",
    days: 90,
  },
} as const;

type PlanKey = keyof typeof plans;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plan = String(body.plan || "quarterly") as PlanKey;
    const userId = String(body.userId || "").trim();
    const telegramUser = body.telegramUser || {};
    const telegramId = String(telegramUser.id || "").trim() || null;
    const telegramUsername = String(telegramUser.username || "").trim() || null;
    const telegramFirstName = String(telegramUser.firstName || "").trim() || null;
    const telegramLastName = String(telegramUser.lastName || "").trim() || null;

    if (!plans[plan]) {
      return NextResponse.json({ error: "Неверный тариф" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Не найден ID пользователя" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL не задан" }, { status: 500 });
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

    const selectedPlan = plans[plan];
    const returnUrl = `${appUrl}/payment/success?uid=${encodeURIComponent(userId)}`;

    const payment = await createYooKassaPayment({
      value: selectedPlan.amount,
      description: selectedPlan.title,
      returnUrl,
      metadata: {
        userId,
        plan,
        days: String(selectedPlan.days),
        telegramId: telegramId || "",
        telegramUsername: telegramUsername || "",
        telegramFirstName: telegramFirstName || "",
        telegramLastName: telegramLastName || "",
      },
    });

    await db.query(
      `
        insert into payments (
          yookassa_payment_id,
          user_id,
          plan,
          amount,
          currency,
          status,
          telegram_id,
          telegram_username,
          telegram_first_name,
          telegram_last_name
        )
        values ($1, $2, $3, $4, 'RUB', $5, $6, $7, $8, $9)
        on conflict (yookassa_payment_id)
        do update set
          status = excluded.status,
          telegram_id = excluded.telegram_id,
          telegram_username = excluded.telegram_username,
          telegram_first_name = excluded.telegram_first_name,
          telegram_last_name = excluded.telegram_last_name
      `,
      [
        payment.id,
        userId,
        plan,
        selectedPlan.amount,
        payment.status || "pending",
        telegramId,
        telegramUsername,
        telegramFirstName,
        telegramLastName,
      ]
    );

    await trackEvent({
      eventName: "payment_create",
      userId,
      telegramId,
      telegramUsername,
      telegramFirstName,
      telegramLastName,
      metadata: {
        plan,
        amount: selectedPlan.amount,
        paymentId: payment.id,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    console.error("Create payment error", error);
    return NextResponse.json({ error: "Не удалось создать оплату" }, { status: 500 });
  }
}
