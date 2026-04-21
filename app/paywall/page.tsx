"use client";

import Link from "next/link";
import { useState } from "react";

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Pro-подписка
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Ты уже увидел, где теряешь баллы. Теперь нужен план, а не хаос.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Открой безлимитные сессии, полный разбор ошибок и персональный маршрут
            по слабым темам.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Что входит в Pro
          </p>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-900">
              Безлимитные тренировки
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-900">
              Повторение слабых тем
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-900">
              Полные объяснения ошибок
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-900">
              Прогресс к целевому баллу
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <button
            type="button"
            onClick={() => setSelectedPlan("weekly")}
            className={`w-full rounded-3xl border p-5 text-left transition ${
              selectedPlan === "weekly"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-900"
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
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-900"
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
            className="block w-full rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white transition hover:opacity-95"
          >
            {selectedPlan === "monthly" ? "Выбрать 28 дней" : "Выбрать 7 дней"}
          </Link>

          <p className="mt-3 text-center text-sm text-slate-500">
            Подписку можно отменить в любой момент
          </p>
        </div>
      </div>
    </main>
  );
}