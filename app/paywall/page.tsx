"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  activatePro,
  buildRoadmap,
  getDiagnosisResult,
  getFreeGateStatus,
  getIncorrectQuestionCount,
  getMiniVariantProgress,
  getProPlanLabel,
  getProSubscription,
  getRepeatInsight,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  type FreeGateStatus,
  type ProPlanKey,
  type ProSubscription,
} from "@/lib/storage";

const planBenefits = [
  "Безлимитные session, чтобы не прерывать темп, когда уже пошёл рабочий ритм",
  "Безлимитные mini-variant, чтобы чаще проверять устойчивость и концентрацию",
  "Умный повтор ошибок, который возвращает слабые вопросы и типы заданий",
  "Roadmap и расширенный progress, чтобы видеть путь к целевому баллу спокойно и понятно",
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
    note: "Подходит, чтобы быстро войти в ритм и проверить эффект",
    hint: "≈ 23 ₽ в день",
  },
  {
    key: "quarterly",
    title: "3 месяца Pro",
    price: "1490 ₽",
    note: "Комфортный горизонт, чтобы подготовка стала ровной и предсказуемой",
    hint: "≈ 16 ₽ в день",
    recommended: true,
  },
];

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<ProPlanKey>("quarterly");
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [purchaseState, setPurchaseState] = useState<"idle" | "processing" | "success">("idle");
  const [sessionGate, setSessionGate] = useState<FreeGateStatus | null>(null);
  const [miniVariantGate, setMiniVariantGate] = useState<FreeGateStatus | null>(null);
  const [subjectLabel, setSubjectLabel] = useState("Русский язык");
  const [weakSummary, setWeakSummary] = useState<string | null>(null);
  const [repeatCount, setRepeatCount] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [completedMiniVariants, setCompletedMiniVariants] = useState(0);
  const [targetLabel, setTargetLabel] = useState("80 баллов");
  const [roadmapNextFocus, setRoadmapNextFocus] = useState("Сначала собрать спокойный и регулярный ритм подготовки.");

  useEffect(() => {
    const current = getProSubscription();
    const profile = getStudentProfile();
    const subject = normalizeSubjectKey(profile?.subject);
    const diagnosisResult = getDiagnosisResult();
    const repeatInsight = getRepeatInsight(subject);
    const sessionProgress = getSessionProgress();
    const miniVariantProgress = getMiniVariantProgress();
    const weakTopics = diagnosisResult?.weakTopics ?? [];
    const nextTargetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80 баллов";

    setSubscription(current);
    setSubjectLabel(getSubjectLabel(profile?.subject));
    setRepeatCount(getIncorrectQuestionCount(subject));
    setSessionsCompleted(sessionProgress?.sessionsCompleted ?? 0);
    setCompletedMiniVariants(miniVariantProgress?.completedCount ?? 0);
    setTargetLabel(nextTargetLabel);
    setSessionGate(getFreeGateStatus("session"));
    setMiniVariantGate(getFreeGateStatus("miniVariant"));
    setWeakSummary(
      repeatInsight.weakTaskTypes[0]?.label
        ? `Уже видно, что чаще всего проседает тип задания ${repeatInsight.weakTaskTypes[0].label}.`
        : weakTopics[0]
          ? `Уже найдена тема, которая требует выравнивания: ${weakTopics[0]}.`
          : "Даже по первым данным уже можно строить более точный план без лишней суеты.",
    );
    setRoadmapNextFocus(
      buildRoadmap({
        subjectLabel: getSubjectLabel(profile?.subject),
        weakTopics,
        sessionsCompleted: sessionProgress?.sessionsCompleted ?? 0,
        streakDays: sessionProgress?.streakDays ?? 0,
        diagnosisCompleted: diagnosisResult?.completedDiagnosis,
        repeatCount: getIncorrectQuestionCount(subject),
        completedMiniVariants: miniVariantProgress?.completedCount ?? 0,
      }).nextFocus,
    );

    if (current.isPro && current.activePlan) {
      setSelectedPlan(current.activePlan);
    }
  }, []);

  const selectedPlanMeta = useMemo(
    () => plans.find((plan) => plan.key === selectedPlan) ?? plans[0],
    [selectedPlan],
  );

  const isPro = Boolean(subscription?.isPro);
  const blockedFeature = sessionGate?.isBlocked ? "session" : miniVariantGate?.isBlocked ? "miniVariant" : null;
  const heroTitle = blockedFeature === "session"
    ? "Лимит на сессию уже сработал, но подготовка как раз набрала смысл"
    : blockedFeature === "miniVariant"
      ? "Лимит на мини-вариант уже сработал, но именно сейчас важно не терять проверку темпа"
      : "Открой Pro и занимайся в понятном ритме, а не урывками";
  const heroText = blockedFeature
    ? `По ${subjectLabel.toLowerCase()} уже собрана полезная картина. ${weakSummary} Pro нужен затем, чтобы продолжить работу без паузы и двигаться к цели ${targetLabel}.`
    : "Pro даёт не просто доступ, а ощущение собранной подготовки: безлимитная практика, повтор ошибок, roadmap и более ясный progress к цели.";

  function handleActivate() {
    setPurchaseState("processing");

    window.setTimeout(() => {
      const next = activatePro(selectedPlan);
      setSubscription(next);
      setPurchaseState("success");
      setSessionGate(getFreeGateStatus("session"));
      setMiniVariantGate(getFreeGateStatus("miniVariant"));
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
              Полный режим подготовки уже открыт.
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-indigo-100/86">
              Можно продолжать подготовку без лимитов, возвращаться к слабым местам и смотреть более полную картину движения к цели.
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

          <section className="rounded-[1.85rem] border border-emerald-100 bg-emerald-50/70 p-5 shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
            <p className="text-sm font-medium text-slate-500">Текущий прогресс</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-slate-500">Сессий</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{sessionsCompleted}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-slate-500">Повтор</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{repeatCount}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="text-slate-500">Мини-варианты</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{completedMiniVariants}</p>
              </div>
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
            {blockedFeature ? "Продолжить без паузы" : "Premium"}
          </span>
        </div>

        <section className="rounded-[2rem] border border-indigo-100/70 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.26),transparent_34%),linear-gradient(135deg,#1e1b4b_0%,#312e81_48%,#4338ca_100%)] p-6 text-white shadow-[0_30px_80px_rgba(49,46,129,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">
            {blockedFeature ? "Free уже показал полезные сигналы" : "Открыть полный режим"}
          </p>
          <h1 className="mt-4 text-[2.45rem] font-black leading-[1.02] tracking-tight">
            {heroTitle}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-indigo-100/86">{heroText}</p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">∞</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">session</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">∞</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">mini-variant</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-lg font-bold">1 план</p>
              <p className="mt-1 text-[11px] text-indigo-100/78">к {targetLabel}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.85rem] border border-white/70 bg-white/88 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <p className="px-2 pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Тарифы</p>
          <div className="space-y-3">
            {plans.map((plan) => {
              const selected = selectedPlan === plan.key;

              return (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`w-full rounded-[1.7rem] border p-4 text-left transition ${
                    selected
                      ? plan.recommended
                        ? "border-indigo-200 bg-[linear-gradient(135deg,#312e81_0%,#4338ca_48%,#6366f1_100%)] text-white shadow-[0_24px_50px_rgba(79,70,229,0.24)]"
                        : "border-indigo-200 bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(129,140,248,0.14))] shadow-[0_18px_36px_rgba(99,102,241,0.14)]"
                      : "border-slate-200 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.04)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold">{plan.title}</p>
                      <p className={`mt-1 text-sm ${selected && plan.recommended ? "text-indigo-100/84" : "text-slate-500"}`}>
                        {plan.note}
                      </p>
                      <p className={`mt-3 text-sm font-medium ${selected && plan.recommended ? "text-white" : "text-emerald-600"}`}>
                        {plan.price}, {plan.hint}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${plan.recommended ? (selected ? "bg-white/14 text-white" : "bg-emerald-100 text-emerald-700") : selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {plan.recommended ? "Рекомендуем" : selected ? "Выбрано" : "План"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.85rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_40px_rgba(99,102,241,0.12)] backdrop-blur-xl">
          {purchaseState === "success" ? (
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 px-4 py-4 text-center">
              <p className="text-sm font-semibold text-emerald-700">Pro активирован</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Демо-покупка завершена. Твой план, {getProPlanLabel(selectedPlan)}, сохранён локально.
              </p>
              <Link href="/home" className="primary-cta mt-4">
                <span className="block leading-none text-white">Открыть кабинет Pro</span>
              </Link>
              <p className="mt-3 text-center text-sm text-slate-500">Pro активируется сразу</p>
            </div>
          ) : (
            <>
              <button type="button" onClick={handleActivate} className={`primary-cta ${purchaseState === "processing" ? "is-disabled" : ""}`}>
                <span className={`block leading-none ${purchaseState === "processing" ? "text-slate-400" : "text-white"}`}>
                  {purchaseState === "processing" ? "Активируем Pro..." : `Оформить Pro, ${selectedPlanMeta.title}`}
                </span>
              </button>
              <p className="mt-3 text-center text-sm text-slate-500">Pro активируется сразу</p>
              <p className="mt-3 text-center text-xs font-medium text-slate-500">
                Это mock purchase flow, без реального списания. После нажатия Pro активируется локально.
              </p>
            </>
          )}

          <p className="mt-3 text-center text-sm text-slate-500">Подписку можно сбросить только вместе с локальными данными приложения</p>
        </section>

        <section className="rounded-[1.85rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Что откроется в Pro</p>
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

        <section className="rounded-[1.85rem] border border-indigo-100 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Что уже нашли</p>
              <p className="mt-2 text-xl font-bold text-slate-900">Подготовка уже персонализируется</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {subjectLabel}
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <p>{weakSummary}</p>
            <p>На повторе сейчас: {repeatCount}. Завершено сессий: {sessionsCompleted}. Мини-вариантов: {completedMiniVariants}.</p>
            <p>Следующий полезный шаг: {roadmapNextFocus}</p>
          </div>
        </section>

        <section className="rounded-[1.85rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[1.5rem] bg-slate-50/90 p-4">
              <p className="font-semibold text-slate-900">Free</p>
              <div className="mt-3 space-y-2 text-slate-600">
                <p>• 1 session в день</p>
                <p>• 1 mini-variant запуск в день</p>
                <p>• Базовый progress и стартовый roadmap</p>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-indigo-50/90 p-4">
              <p className="font-semibold text-slate-900">Pro</p>
              <div className="mt-3 space-y-2 text-slate-700">
                <p>• Безлимитные session</p>
                <p>• Безлимитные mini-variant</p>
                <p>• Умный повтор, расширенный progress, движение к цели</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
