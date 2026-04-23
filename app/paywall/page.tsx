"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  activatePro,
  getProPlanLabel,
  getProSubscription,
  type ProPlanKey,
  type ProSubscription,
} from "@/lib/storage";

const planBenefits = [
  "Безлимитные тренировки по твоему предмету",
  "Персональный разбор ошибок и повтор слабых тем",
  "Прогресс к целевому баллу без хаоса и догадок",
  "Мини-варианты и маршрут в одном ритме",
];

const plans: Array<{
  key: ProPlanKey;
  title: string;
  price: string;
  note: string;
  hint: string;
  recommended?: boolean;
}> = [
  {
    key: "monthly",
    title: "1 месяц Pro",
    price: "690 ₽",
    note: "Лучший старт, чтобы быстро войти в ритм",
    hint: "≈ 23 ₽ в день",
  },
  {
    key: "quarterly",
    title: "3 месяца Pro",
    price: "1490 ₽",
    note: "Больше времени на стабильный рост и спокойную подготовку",
    hint: "≈ 16 ₽ в день",
    recommended: true,
  },
];

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<ProPlanKey>("quarterly");
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [purchaseState, setPurchaseState] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    const current = getProSubscription();
    setSubscription(current);

    if (current.isPro && current.activePlan) {
      setSelectedPlan(current.activePlan);
    }
  }, []);

  const selectedPlanMeta = useMemo(
    () => plans.find((plan) => plan.key === selectedPlan) ?? plans[0],
    [selectedPlan],
  );

  const isPro = Boolean(subscription?.isPro);

  function handleActivate() {
    setPurchaseState("processing");

    window.setTimeout(() => {
      const next = activatePro(selectedPlan);
      setSubscription(next);
      setPurchaseState("success");
    }, 650);
  }

  if (isPro) {
    return (
      <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4">
          <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
            <span>Pro-подписка</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Активна
            </span>
          </div>

          <section className="rounded-[2rem] border border-indigo-100/70 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.26),transparent_34%),linear-gradient(135deg,#1e1b4b_0%,#312e81_48%,#4338ca_100%)] p-6 text-white shadow-[0_30px_80px_rgba(49,46,129,0.28)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">Pro активирован</p>
            <h1 className="mt-4 text-[2.35rem] font-black leading-[1.02] tracking-tight">
              У тебя уже открыт полный режим подготовки.
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-indigo-100/86">
              Можно продолжать сессии, смотреть прогресс и держать стабильный маршрут без ограничений.
            </p>

            <div className="mt-5 rounded-[1.6rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-medium text-indigo-100">Текущий план</p>
              <p className="mt-2 text-2xl font-black text-white">{getProPlanLabel(subscription?.activePlan)}</p>
              <p className="mt-2 text-sm text-indigo-100/84">
                Активирован {subscription?.activatedAt ? new Date(subscription.activatedAt).toLocaleDateString("ru-RU") : "сейчас"}
              </p>
            </div>
          </section>

          <section className="rounded-[1.85rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Что уже доступно</p>
            <div className="mt-4 space-y-3">
              {planBenefits.map((benefit, index) => (
                <div key={benefit} className="flex items-start gap-3 rounded-[1.3rem] bg-slate-50/85 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-auto rounded-[1.8rem] border border-white/70 bg-white/80 p-3 shadow-[0_18px_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
            <Link href="/home" className="primary-cta">
              <span className="block leading-none text-white">Перейти в кабинет Pro</span>
            </Link>
            <p className="mt-3 text-center text-sm text-slate-500">Подписка уже активна локально в этом демо-потоке</p>
          </div>
        </div>
      </main>
    );
  }

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
            Получи Pro и занимайся в понятном ритме, а не урывками.
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
              <p className="text-lg font-bold">100%</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">разбор</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">1 план</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">под тебя</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.85rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Почему Pro реально полезен</p>
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
          {plans.map((plan) => {
            const selected = selectedPlan === plan.key;

            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelectedPlan(plan.key)}
                className={`w-full rounded-[1.9rem] border p-5 text-left transition ${
                  selected
                    ? plan.recommended
                      ? "border-indigo-200 bg-[linear-gradient(135deg,#312e81_0%,#4338ca_48%,#6366f1_100%)] text-white shadow-[0_28px_55px_rgba(79,70,229,0.28)]"
                      : "border-indigo-200 bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(129,140,248,0.14))] shadow-[0_20px_40px_rgba(99,102,241,0.16)]"
                    : "border-white/70 bg-white/78 shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold">{plan.title}</p>
                    <p className={`mt-1 text-sm ${selected && plan.recommended ? "text-indigo-100/84" : "text-slate-500"}`}>
                      {plan.note}
                    </p>
                    <p className={`mt-3 text-sm font-medium ${selected && plan.recommended ? "text-white" : "text-emerald-600"}`}>
                      {plan.price}, {plan.hint}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.recommended ? (selected ? "bg-white/14 text-white" : "bg-emerald-100 text-emerald-700") : selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {plan.recommended ? "Рекомендуем" : selected ? "Выбрано" : "План"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto rounded-[1.8rem] border border-white/70 bg-white/80 p-3 shadow-[0_18px_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
          {purchaseState === "success" ? (
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-center">
              <p className="text-sm font-semibold text-emerald-700">Pro активирован</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Демо-покупка завершена. Твой план, {getProPlanLabel(selectedPlan)}, сохранён локально.
              </p>
              <Link href="/home" className="primary-cta mt-4">
                <span className="block leading-none text-white">Открыть кабинет Pro</span>
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-2 text-center text-xs font-medium text-slate-500">
                Это mock purchase flow, без реального списания. После нажатия Pro активируется локально.
              </p>
              <button type="button" onClick={handleActivate} className={`primary-cta ${purchaseState === "processing" ? "is-disabled" : ""}`}>
                <span className={`block leading-none ${purchaseState === "processing" ? "text-slate-400" : "text-white"}`}>
                  {purchaseState === "processing" ? "Активируем Pro..." : `Оформить Pro, ${selectedPlanMeta.title}`}
                </span>
              </button>
            </>
          )}

          <p className="mt-3 text-center text-sm text-slate-500">Подписку можно сбросить только вместе с локальными данными приложения</p>
        </div>
      </div>
    </main>
  );
}
