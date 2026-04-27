"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopMenu from "@/app/components/TopMenu";
import {
  activatePro,
  getFreeGateStatus,
  getProPlanLabel,
  getProSubscription,
  getRepeatInsight,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  type ProPlanKey,
  type ProSubscription,
} from "@/lib/storage";

const plans: Array<{ key: ProPlanKey; title: string; price: string; note: string; badge?: string }> = [
  { key: "monthly", title: "1 месяц", price: "690 ₽", note: "быстро войти в ритм" },
  { key: "quarterly", title: "3 месяца", price: "1490 ₽", note: "лучший горизонт", badge: "рекомендуем" },
];

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<ProPlanKey>("quarterly");
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [subjectLabel, setSubjectLabel] = useState("предмет");
  const [repeatCount, setRepeatCount] = useState(0);
  const [sessionGate, setSessionGate] = useState<ReturnType<typeof getFreeGateStatus> | null>(null);
  const [miniGate, setMiniGate] = useState<ReturnType<typeof getFreeGateStatus> | null>(null);

  useEffect(() => {
    const profile = getStudentProfile();
    const subject = normalizeSubjectKey(profile?.subject);
    setSubjectLabel(getSubjectLabel(subject));
    setRepeatCount(getRepeatInsight(subject).repeatCount);
    setSessionGate(getFreeGateStatus("session"));
    setMiniGate(getFreeGateStatus("miniVariant"));
    setSubscription(getProSubscription());
  }, []);

  const isPro = Boolean(subscription?.isPro);

  const handleActivate = () => {
    const next = activatePro(selectedPlan);
    setSubscription(next);
  };

  if (isPro) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
        <TopMenu subtitle="подписка активна" />
        <div className="mx-auto w-full max-w-md pt-7">
          <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-7">
            <p className="text-sm font-semibold text-emerald-700">Pro активирован</p>
            <h1 className="mt-2 text-[2.1rem] font-black leading-tight tracking-[-0.055em]">Ты в полном режиме подготовки</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">Безлимитные тренировки, мини-варианты, повторы и расширенный прогресс уже включены.</p>
            <Link href="/home" className="mt-7 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-semibold text-white">Вернуться к тренировке</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle="Pro" />

      <div className="mx-auto w-full max-w-md space-y-8 pt-7">
        <section>
          <p className="text-sm text-slate-500">для ученика и родителя</p>
          <h1 className="mt-2 text-[2.35rem] font-black leading-[1.04] tracking-[-0.055em]">Открой полный маршрут подготовки</h1>
          <p className="mt-4 text-lg leading-7 text-slate-500">Безлимитные тренировки, мини-варианты на 20 заданий, типовые задания по формату ЕГЭ, моментальная проверка, решения и разбор ошибок.</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {plans.map((plan) => {
            const active = selectedPlan === plan.key;
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelectedPlan(plan.key)}
                className={`relative rounded-[1.5rem] border p-5 text-left transition ${active ? "border-blue-600 bg-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white/80"}`}
              >
                {plan.badge && <span className="absolute right-3 top-3 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{plan.badge}</span>}
                <div className="text-lg font-bold">{plan.title}</div>
                <div className="mt-3 text-2xl font-black">{plan.price}</div>
                <div className="mt-1 text-sm leading-5 text-slate-500">{plan.note}</div>
              </button>
            );
          })}
        </section>

        <button type="button" onClick={handleActivate} className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-center text-lg font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,0.22)]">
          Оформить Pro
        </button>
        <p className="-mt-5 text-center text-sm text-slate-500">Pro активируется сразу. Сейчас это mock purchase flow без списания.</p>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Что открывает Pro</h2>
          <div className="mt-4 space-y-3 text-base text-slate-700">
            <p>• Безлимитные тренировки по предметам</p>
            <p>• Мини-варианты на 20 заданий без лимита</p>
            <p>• Моментальная проверка, решения и повтор ошибок</p>
            <p>• Прогресс, понятный ученику и родителю</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-blue-50/70 p-6">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Почему это похоже на подготовку, а не тестик</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Предмет: {subjectLabel}. В основе — тренировки по предметам и типам заданий, типовые задания по формату ЕГЭ, моментальная проверка, решения и повтор ошибок. Сейчас на повторе: {repeatCount}. Free-лимиты: session {sessionGate?.count ?? 0}/{sessionGate?.limit ?? 1}, mini {miniGate?.count ?? 0}/{miniGate?.limit ?? 1}.
          </p>
        </section>
      </div>
    </main>
  );
}
