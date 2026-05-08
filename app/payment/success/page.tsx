"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { activatePro, getPaymentUserId, type ProPlanKey } from "@/lib/storage";

type Status = "checking" | "active" | "pending" | "error";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("uid") || getPaymentUserId();

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const response = await fetch(`/api/subscription?userId=${encodeURIComponent(userId)}`, {
            cache: "no-store",
          });
          const data = await response.json();

          if (cancelled) return;

          if (data.active) {
            activatePro((data.subscription?.plan || "monthly") as ProPlanKey, data.subscription?.expires_at || data.subscription?.expiresAt);
            setStatus("active");
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
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
          {status === "checking" && (
            <>
              <p className="text-sm font-semibold text-blue-700">Проверяем оплату</p>
              <h1 className="mt-2 text-[2rem] font-black leading-tight tracking-[-0.055em]">Ждём подтверждение от ЮKassa</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">Обычно это занимает несколько секунд. Страница обновит доступ автоматически.</p>
            </>
          )}

          {status === "active" && (
            <>
              <p className="text-sm font-semibold text-emerald-700">Оплата прошла</p>
              <h1 className="mt-2 text-[2rem] font-black leading-tight tracking-[-0.055em]">Pro активирован</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">Теперь доступны безлимитные тренировки, мини-варианты и расширенный прогресс.</p>
            </>
          )}

          {status === "pending" && (
            <>
              <p className="text-sm font-semibold text-amber-700">Оплата в обработке</p>
              <h1 className="mt-2 text-[2rem] font-black leading-tight tracking-[-0.055em]">Доступ скоро включится</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">Если деньги списались, подожди немного и вернись на страницу Pro. Webhook может прийти с задержкой.</p>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-sm font-semibold text-red-700">Не удалось проверить оплату</p>
              <h1 className="mt-2 text-[2rem] font-black leading-tight tracking-[-0.055em]">Попробуй открыть Pro ещё раз</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">Если оплата прошла, доступ подтянется после проверки подписки.</p>
            </>
          )}

          <Link href="/home" className="mt-7 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-semibold text-white">
            Вернуться в EGE Trainer
          </Link>
        </section>
      </div>
    </main>
  );
}
