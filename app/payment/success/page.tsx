"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  activatePro,
  getPaymentUserId,
  type ProPlanKey,
} from "@/lib/storage";

type Status = "checking" | "active" | "pending" | "error";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("uid") || getPaymentUserId();

      for (let attempt = 0; attempt < 12; attempt += 1) {
        try {
          const response = await fetch(
            `/api/subscription?userId=${encodeURIComponent(userId)}`,
            { cache: "no-store" }
          );

          const data = await response.json();

          if (cancelled) return;

          if (data.active) {
            activatePro(
              (data.subscription?.plan || "monthly") as ProPlanKey,
              data.subscription?.expires_at || data.subscription?.expiresAt
            );

            setStatus("active");

            setTimeout(() => {
              window.location.href = "/account";
            }, 2200);

            return;
          }
        } catch {
          if (!cancelled) setStatus("error");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      if (!cancelled) setStatus("pending");
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-black leading-none text-white">
              ЕГЭ
            </span>
            <span className="text-lg font-black">Plan</span>
          </Link>

          <Link
            href="/account"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white"
          >
            Кабинет
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-xl rounded-[2.2rem] border border-white/10 bg-white p-7 text-slate-950 shadow-2xl">
            {status === "checking" ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  ⏳
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                  Проверяем оплату
                </p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                  Ждём подтверждение от ЮKassa
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Обычно это занимает несколько секунд. Как только оплата подтвердится,
                  мы включим Pro и отправим вас в кабинет.
                </p>
              </>
            ) : null}

            {status === "active" ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                  ✅
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
                  Оплата прошла
                </p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                  Pro активирован
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Теперь доступны тренировки, мини-варианты, повтор ошибок и прогресс.
                  Сейчас откроем личный кабинет.
                </p>
              </>
            ) : null}

            {status === "pending" ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                  🕒
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-amber-600">
                  Оплата в обработке
                </p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                  Доступ скоро включится
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Деньги списались, но подтверждение от ЮKassa может прийти с задержкой.
                  Откройте кабинет через пару минут — Pro должен подтянуться автоматически.
                </p>
              </>
            ) : null}

            {status === "error" ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                  ⚠️
                </div>
                <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-red-600">
                  Не удалось проверить оплату
                </p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                  Откройте кабинет чуть позже
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Если оплата прошла, доступ включится после проверки. Обычно это занимает
                  немного времени.
                </p>
              </>
            ) : null}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                href="/account"
                className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white shadow-xl shadow-blue-600/20"
              >
                Перейти в кабинет
              </Link>

              <Link
                href="/paywall"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
              >
                Проверить Pro
              </Link>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Не закрывайте страницу сразу после оплаты: подтверждение может идти несколько секунд.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
