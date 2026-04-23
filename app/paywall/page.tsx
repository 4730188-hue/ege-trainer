"use client";

import Link from "next/link";
import { useState } from "react";

const planBenefits = [
  "Безлимитные тренировки по твоему предмету",
  "Персональный разбор ошибок и повтор слабых тем",
  "Прогресс к целевому баллу без хаоса и догадок",
];

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");

  return (
    <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>Pro-подписка</span>
          <span className="rounded-full bg-indigo-100/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            Premium
          </span>
        </div>

        <section className="rounded-[2rem] border border-indigo-100/70 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.26),transparent_34%),linear-gradient(135deg,#1e1b4b_0%,#312e81_48%,#4338ca_100%)] p-6 text-white shadow-[0_30px_80px_rgba(49,46,129,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">Открыть полный режим</p>
          <h1 className="mt-4 text-[2.45rem] font-black leading-[1.02] tracking-tight">
            Ты уже увидел картину. Теперь преврати её в рост баллов.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-indigo-100/86">
            Pro даёт не просто доступ, а ощущение собранной подготовки: сессии, объяснения, повторение ошибок и маршрут к цели.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">∞</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">сессии</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">8/8</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">разбор</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">1 план</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">под тебя</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.85rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Что внутри Pro</p>
          <div className="mt-4 space-y-3">
            {planBenefits.map((benefit, index) => (
              <div key={benefit} className="flex items-start gap-3 rounded-[1.3rem] bg-slate-50/85 px-4 py-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSelectedPlan("weekly")}
            className={`w-full rounded-[1.8rem] border p-5 text-left transition ${
              selectedPlan === "weekly"
                ? "border-indigo-200 bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(129,140,248,0.14))] shadow-[0_20px_40px_rgba(99,102,241,0.16)]"
                : "border-white/70 bg-white/78 shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-slate-950">199 ₽ / 7 дней</p>
                <p className="mt-1 text-sm text-slate-500">Быстрый старт, чтобы попробовать ритм</p>
              </div>
              {selectedPlan === "weekly" && (
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Выбрано</span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`w-full rounded-[1.9rem] border p-5 text-left transition ${
              selectedPlan === "monthly"
                ? "border-indigo-200 bg-[linear-gradient(135deg,#312e81_0%,#4338ca_48%,#6366f1_100%)] text-white shadow-[0_28px_55px_rgba(79,70,229,0.28)]"
                : "border-white/70 bg-white/78 shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-bold">690 ₽ / 28 дней</p>
                <p className={`mt-1 text-sm ${selectedPlan === "monthly" ? "text-indigo-100/84" : "text-slate-500"}`}>
                  Лучший выбор, чтобы реально увидеть рост
                </p>
                <p className={`mt-3 text-sm font-medium ${selectedPlan === "monthly" ? "text-white" : "text-emerald-600"}`}>
                  ≈ 24 ₽ в день, выгоднее недельного тарифа
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedPlan === "monthly" ? "bg-white/14 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                Выгоднее
              </span>
            </div>
          </button>
        </div>

        <div className="mt-auto rounded-[1.8rem] border border-white/70 bg-white/80 p-3 shadow-[0_18px_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
          <p className="mb-2 text-center text-xs font-medium text-slate-500">Можно выбрать быстрый старт или более выгодный длинный ритм</p>
          <Link
            href="/home"
            className="primary-cta"
          >
            <span className="block leading-none text-white">
              {selectedPlan === "monthly" ? "Выбрать 28 дней Pro" : "Выбрать 7 дней Pro"}
            </span>
          </Link>

          <p className="mt-3 text-center text-sm text-slate-500">Подписку можно отменить в любой момент</p>
        </div>
      </div>
    </main>
  );
}
