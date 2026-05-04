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

    if (!userId) {
      console.error("YooKassa payment without userId metadata", paymentId);
      return NextResponse.json({ ok: true });
    }

    await db.query("begin");

    try {
      await db.query(
        `
          update payments
          set status = 'succeeded', paid_at = now()
          where yookassa_payment_id = $1
        `,
        [paymentId]
      );

      await db.query(
        `
          insert into subscriptions (user_id, plan, active, starts_at, expires_at, updated_at)
          values ($1, $2, true, now(), now() + ($3 || ' days')::interval, now())
          on conflict (user_id)
          do update set
            plan = excluded.plan,
            active = true,
            expires_at = case
              when subscriptions.expires_at > now()
              then subscriptions.expires_at + ($3 || ' days')::interval
              else now() + ($3 || ' days')::interval
            end,
            updated_at = now()
        `,
        [userId, plan, days]
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
