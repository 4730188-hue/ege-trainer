"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearWebAccountUserId,
  getPaymentUserId,
  getProPlanLabel,
  syncProSubscriptionFromServer,
  type ProSubscription,
} from "@/lib/storage";

type User = {
  id: string;
  email: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meResponse.json();

        if (!me.user) {
          window.location.href = "/login";
          return;
        }

        setUser(me.user);

        const sub = await syncProSubscriptionFromServer();
        setSubscription(sub);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    clearWebAccountUserId();
    window.location.href = "/login";
  }

  const isPro = Boolean(subscription?.isPro);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-5 py-8 text-slate-950">
        <div className="mx-auto max-w-md">
          <p>Загружаем кабинет...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-md space-y-5">
        <section>
          <p className="text-sm text-slate-500">web-кабинет</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Личный кабинет
          </h1>
          <p className="mt-3 text-slate-600">
            Результаты, прогресс и доступ сохраняются за вашим аккаунтом.
          </p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Email</p>
          <p className="mt-1 font-bold">{user?.email}</p>

          <p className="mt-5 text-sm text-slate-500">ID оплаты</p>
          <p className="mt-1 break-all text-xs text-slate-600">{getPaymentUserId()}</p>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
          <p className="text-sm font-bold text-blue-700">
            {isPro ? "Pro активен" : "Free-доступ"}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {isPro ? getProPlanLabel(subscription?.activePlan) : "Начните с бесплатного дня"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isPro
              ? "Можно продолжать тренировки, мини-варианты и повтор ошибок."
              : "Пройдите День 1 бесплатно, а затем откройте план на 7 дней или месяц."}
          </p>

          <div className="mt-5 grid gap-3">
            <Link
              href="/task-training?source=account"
              className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white"
            >
              Продолжить тренировку
            </Link>

            {!isPro ? (
              <Link
                href="/paywall?source=account"
                className="rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center font-black text-blue-700"
              >
                Открыть Pro
              </Link>
            ) : null}
          </div>
        </section>

        <section className="grid gap-3">
          <Link
            href="/home"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-bold text-slate-800"
          >
            Открыть тренажёр
          </Link>

          <Link
            href="/profile"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-bold text-slate-800"
          >
            Профиль подготовки
          </Link>

          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-bold text-slate-500"
          >
            Выйти
          </button>
        </section>
      </div>
    </main>
  );
}
