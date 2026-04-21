"use client";

import Link from "next/link";
import { useState } from "react";

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Pro-подписка</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Premium
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Ты уже увидел, где теряешь баллы. Теперь нужен план, а не хаос.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Открой безлимитные сессии, полный разбор ошибок и персональный маршрут
            по слабым темам.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Что входит в Pro
          </p>

          <div className="space-y-3">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Безлимитные тренировки
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Повторение слабых тем
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Полные объяснения ошибок
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Прогресс к целевому баллу
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSelectedPlan("weekly")}
            className={`w-full rounded-3xl border p-5 text-left transition ${
              selectedPlan === "weekly"
                ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                : "border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">199 ₽ / 7 дней</p>
                <p
                  className={`mt-1 text-sm ${
                    selectedPlan === "weekly" ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  Быстрый старт
                </p>
              </div>

              {selectedPlan === "weekly" && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  Выбрано
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`w-full rounded-3xl border p-5 text-left transition ${
              selectedPlan === "monthly"
                ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                : "border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">690 ₽ / 28 дней</p>
                <p
                  className={`mt-1 text-sm ${
                    selectedPlan === "monthly" ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  Лучший выбор
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedPlan === "monthly"
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Выгоднее
              </span>
            </div>
          </button>
        </div>

        <div className="mt-auto pb-4">
          <Link
            href="/home"
            className="block w-full rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold shadow-sm shadow-slate-300/40 transition hover:opacity-95"
          >
            <span className="block leading-none text-white">
              {selectedPlan === "monthly" ? "Выбрать 28 дней" : "Выбрать 7 дней"}
            </span>
          </Link>

          <p className="mt-3 text-center text-sm text-slate-500">
            Подписку можно отменить в любой момент
          </p>
        </div>
      </div>
    </main>
  );
}
