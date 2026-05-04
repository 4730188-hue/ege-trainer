import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createYooKassaPayment } from "@/lib/yookassa";

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
      },
    });

    await db.query(
      `
        insert into payments (yookassa_payment_id, user_id, plan, amount, currency, status)
        values ($1, $2, $3, $4, 'RUB', $5)
        on conflict (yookassa_payment_id)
        do update set status = excluded.status
      `,
      [payment.id, userId, plan, selectedPlan.amount, payment.status || "pending"]
    );

    return NextResponse.json({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    console.error("Create payment error", error);
    return NextResponse.json({ error: "Не удалось создать оплату" }, { status: 500 });
  }
}
