"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildReadiness,
  buildRoadmap,
  getDiagnosisResult,
  getExamTimelineLabel,
  getFreeGateStatus,
  getIncorrectQuestionCount,
  getMiniVariantProgress,
  getRepeatInsight,
  getProPlanLabel,
  getProSubscription,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  updateStudentSubject,
  type DiagnosisResult,
  type FreeGateStatus,
  type MiniVariantProgress,
  type ProSubscription,
  type SessionProgress,
  type StudentProfile,
  type WeakTaskTypeEntry,
} from "@/lib/storage";

const subjectOptions = [
  { key: "russian", label: "Русский язык" },
  { key: "math", label: "Профильная математика" },
  { key: "social", label: "Обществознание" },
] as const;

function getToneClasses(tone: "indigo" | "green" | "amber") {
  if (tone === "green") {
    return {
      card: "border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.94),rgba(220,252,231,0.88))]",
      badge: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
    };
  }

  if (tone === "amber") {
    return {
      card: "border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.94),rgba(255,247,237,0.9))]",
      badge: "bg-amber-100 text-amber-700",
      text: "text-amber-700",
    };
  }

  return {
    card: "border-indigo-200/80 bg-[linear-gradient(135deg,rgba(238,242,255,0.96),rgba(224,231,255,0.92))]",
    badge: "bg-indigo-100 text-indigo-700",
    text: "text-indigo-700",
  };
}

function getWeaknessSummary(weakTopics: string[], weakTaskTypes: WeakTaskTypeEntry[], repeatCount: number) {
  if (weakTaskTypes[0]?.label) {
    return `Уже видно, что чаще проседает тип задания ${weakTaskTypes[0].label}${repeatCount > 0 ? `, а на повторе сейчас ${repeatCount}.` : "."}`;
  }

  if (weakTopics[0]) {
    return `Уже найдена слабая тема, ${weakTopics[0]}. Следующий шаг, не терять ритм и добить её повтором.`;
  }

  return "Даже по первым данным уже можно собрать спокойный и понятный маршрут подготовки без угадываний.";
}

function getBlockedFeature(gates: { session: FreeGateStatus; miniVariant: FreeGateStatus }) {
  if (gates.session.isBlocked) return "session" as const;
  if (gates.miniVariant.isBlocked) return "miniVariant" as const;
  return null;
}

export default function HomePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [miniVariantProgress, setMiniVariantProgress] = useState<MiniVariantProgress | null>(null);
  const [repeatCount, setRepeatCount] = useState(0);
  const [weakTaskTypes, setWeakTaskTypes] = useState<WeakTaskTypeEntry[]>([]);
  const [hasPersistentWeakness, setHasPersistentWeakness] = useState(false);
  const [proSubscription, setProSubscription] = useState<ProSubscription | null>(null);
  const [sessionGate, setSessionGate] = useState<FreeGateStatus | null>(null);
  const [miniVariantGate, setMiniVariantGate] = useState<FreeGateStatus | null>(null);

  const syncHomeState = (nextProfile: StudentProfile | null) => {
    const subject = normalizeSubjectKey(nextProfile?.subject);
    const repeatInsight = getRepeatInsight(subject);

    setProfile(nextProfile);
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
    setMiniVariantProgress(getMiniVariantProgress());
    setRepeatCount(getIncorrectQuestionCount(subject));
    setWeakTaskTypes(repeatInsight.weakTaskTypes);
    setHasPersistentWeakness(repeatInsight.persistentWeaknessCount > 0);
    setProSubscription(getProSubscription());
    setSessionGate(getFreeGateStatus("session"));
    setMiniVariantGate(getFreeGateStatus("miniVariant"));
  };

  useEffect(() => {
    syncHomeState(getStudentProfile());
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject);
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80 баллов";
  const dailyLabel = profile?.dailyMinutes ? `${profile.dailyMinutes} минут в день` : null;
  const timelineLabel = getExamTimelineLabel(profile?.examTimeline);
  const levelLabel = diagnosisResult?.levelLabel ?? null;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const weakTopicsPreview = weakTopics.slice(0, 2).join(", ");
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const streakDays = sessionProgress?.streakDays ?? 0;
  const completedMiniVariants = miniVariantProgress?.completedCount ?? 0;
  const lastMiniResult = miniVariantProgress?.lastResult ?? null;
  const focusTaskType = weakTaskTypes[0]?.label ?? null;
  const focusLabel = focusTaskType ?? weakTopics[0] ?? subjectLabel;
  const diagnosisStatus = diagnosisResult?.completedDiagnosis
    ? levelLabel
      ? `Стартовый срез собран, уровень ${levelLabel}`
      : "Стартовый срез собран"
    : "Стартовый срез ещё не собран";

  const roadmap = useMemo(
    () =>
      buildRoadmap({
        subjectLabel,
        weakTopics,
        sessionsCompleted,
        streakDays,
        diagnosisCompleted: diagnosisResult?.completedDiagnosis,
        repeatCount,
        completedMiniVariants,
      }),
    [subjectLabel, weakTopics, sessionsCompleted, streakDays, diagnosisResult, repeatCount, completedMiniVariants],
  );

  const readiness = useMemo(
    () =>
      buildReadiness({
        targetLabel,
        diagnosisCompleted: diagnosisResult?.completedDiagnosis,
        sessionsCompleted,
        streakDays,
        weakTopics,
        repeatCount,
        completedMiniVariants,
        lastMiniCorrectAnswers: lastMiniResult?.correctAnswers,
        lastMiniTotalQuestions: lastMiniResult?.totalQuestions,
      }),
    [targetLabel, diagnosisResult, sessionsCompleted, streakDays, weakTopics, repeatCount, completedMiniVariants, lastMiniResult],
  );

  const readinessTone = getToneClasses(readiness.tone);
  const isPro = Boolean(proSubscription?.isPro);
  const blockedFeature = sessionGate && miniVariantGate ? getBlockedFeature({ session: sessionGate, miniVariant: miniVariantGate }) : null;
  const gateSummary = blockedFeature === "session"
    ? "Лимит на сессию сегодня уже исчерпан, но карта слабых мест уже собрана и её можно продолжить в Pro без пауз."
    : blockedFeature === "miniVariant"
      ? "Лимит на мини-вариант сегодня уже исчерпан, а значит дальше важнее не прерывать проверку темпа и устойчивости."
      : null;

  const handleSubjectChange = (subject: "russian" | "math" | "social") => {
    const nextProfile = updateStudentSubject(subject);
    syncHomeState(nextProfile);
  };

  return (
    <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>Учебный кабинет</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
              {subjectLabel}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100/90 text-indigo-700"}`}>
              {isPro ? "Pro активирован" : "Free"}
            </span>
          </div>
        </div>

        <section className="rounded-[2rem] border border-indigo-100/70 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.26),transparent_32%),linear-gradient(135deg,#1e1b4b_0%,#312e81_50%,#4338ca_100%)] p-5 text-white shadow-[0_30px_80px_rgba(49,46,129,0.28)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-indigo-100/84">Персональный план тренировки</p>
              <h1 className="mt-3 text-[2.2rem] font-black leading-[1.02] tracking-tight">
                {subjectLabel}
              </h1>
              <p className="mt-3 text-sm leading-6 text-indigo-100/84">
                {roadmap.homeStatus}
              </p>
            </div>
            <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/90">
              {profile?.dailyMinutes ? `${profile.dailyMinutes} мин / день` : "7 минут"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-100/72">Цель</p>
              <p className="mt-1 text-lg font-bold">{targetLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-100/72">Сессий</p>
              <p className="mt-1 text-lg font-bold">{sessionsCompleted}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-100/72">Streak</p>
              <p className="mt-1 text-lg font-bold">{streakDays}</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-indigo-100/84">Статус доступа</p>
              <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold text-white/90">
                {isPro ? getProPlanLabel(proSubscription?.activePlan) : "Free сегодня"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-indigo-100/88">
              <div className="rounded-2xl bg-white/10 p-3">
                <p>Сессия</p>
                <p className="mt-1 font-semibold text-white">{isPro ? "без лимита" : `${sessionGate?.count ?? 0}/${sessionGate?.limit ?? 1} сегодня`}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p>Мини-вариант</p>
                <p className="mt-1 font-semibold text-white">{isPro ? "без лимита" : `${miniVariantGate?.count ?? 0}/${miniVariantGate?.limit ?? 1} сегодня`}</p>
              </div>
            </div>
            {!isPro && (
              <p className="mt-3 text-sm leading-6 text-indigo-100/82">
                Free помогает войти в ритм, а Pro открывает безлимитную практику, roadmap и более глубокий прогресс к целевому баллу.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-indigo-100/84">Предмет</p>
              <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold text-white/90">
                Быстрый переключатель
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {subjectOptions.map((option) => {
                const isActive = normalizeSubjectKey(profile?.subject) === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleSubjectChange(option.key)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "border-white/30 bg-white text-slate-900 shadow-sm shadow-indigo-950/10"
                        : "border-white/12 bg-white/8 text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-indigo-100/84">Текущий тренировочный фокус</p>
              {focusTaskType && (
                <span className="rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold text-white/90">
                  {hasPersistentWeakness ? `Слабость: ${focusTaskType}` : `Фокус: ${focusTaskType}`}
                </span>
              )}
            </div>
            <p className="mt-2 text-lg font-semibold text-white">{focusLabel}</p>
            <p className="mt-2 text-sm leading-6 text-indigo-100/84">
              {focusTaskType
                ? `${hasPersistentWeakness ? "Уже видна устойчивая слабость" : "По ошибкам пока чаще всплывает"} в типе задания: ${focusTaskType}${weakTopicsPreview ? `. Рядом по темам, ${weakTopicsPreview}.` : "."}`
                : weakTopicsPreview
                  ? `Сильнее всего сейчас окупится работа по темам: ${weakTopicsPreview}.`
                  : dailyLabel
                    ? `Держим реалистичный темп: ${dailyLabel}. Маленькая сессия сегодня важнее идеального плана завтра.`
                    : "Короткая сессия сегодня поможет удержать ритм и сделать прогресс осязаемым."}
            </p>
          </div>

          <p className="mt-4 text-xs font-medium text-indigo-100/70">Короткая сессия займёт всего несколько минут и подтянет слабые места.</p>
          <Link href="/session" className="primary-cta mt-5">
            <span className="block leading-none text-white">Начать тренировку</span>
          </Link>
        </section>

        {isPro ? (
          <section className="rounded-[1.8rem] border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(220,252,231,0.9))] p-5 shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Pro активирован</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {getProPlanLabel(proSubscription?.activePlan)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Полный режим уже открыт. Можно идти без пауз по тренировкам, мини-вариантам, умному повтору ошибок и дорожной карте к цели.
            </p>
          </section>
        ) : (
          <section className={`rounded-[1.8rem] border p-5 shadow-[0_18px_45px_rgba(99,102,241,0.08)] ${blockedFeature ? "border-indigo-200 bg-[linear-gradient(135deg,rgba(238,242,255,0.98),rgba(224,231,255,0.95))]" : "border-white/70 bg-white/78 backdrop-blur-xl"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Free и Pro</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {blockedFeature ? "Подготовка уже упёрлась в дневной лимит" : "Что уже открыто и что добавит Pro"}
                </h2>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {blockedFeature ? "Есть повод открыть Pro" : "Без давления"}
              </span>
            </div>

            {gateSummary && <p className="mt-3 text-sm leading-6 text-slate-700">{gateSummary}</p>}
            <p className="mt-3 text-sm leading-6 text-slate-600">{getWeaknessSummary(weakTopics, weakTaskTypes, repeatCount)}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50/90 p-4">
                <p className="font-semibold text-slate-900">Free сейчас</p>
                <div className="mt-2 space-y-2 text-slate-600">
                  <p>• 1 session в день</p>
                  <p>• 1 mini-variant запуск в день</p>
                  <p>• Базовый прогресс и стартовый фокус</p>
                </div>
              </div>
              <div className="rounded-2xl bg-indigo-50/90 p-4">
                <p className="font-semibold text-slate-900">Pro открывает</p>
                <div className="mt-2 space-y-2 text-slate-700">
                  <p>• Безлимитные session и mini-variant</p>
                  <p>• Умный повтор ошибок и слабых типов заданий</p>
                  <p>• Roadmap и более ясное движение к {targetLabel}</p>
                </div>
              </div>
            </div>

            <Link href="/paywall" className="primary-cta mt-5">
              <span className="block leading-none text-white">Посмотреть Pro</span>
            </Link>
          </section>
        )}

        <section className={`rounded-[1.8rem] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${readinessTone.card}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Цель и готовность</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${readinessTone.badge}`}>
              {readiness.statusLabel}
            </span>
          </div>

          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{targetLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{readiness.closenessText}</p>
          <p className={`mt-3 text-sm font-semibold ${readinessTone.text}`}>{readiness.nextFocus}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/72 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Стартовый срез</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{diagnosisStatus}</p>
            </div>
            <div className="rounded-2xl bg-white/72 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Срок</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{timelineLabel ?? "Без дедлайна"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Следующая тренировка</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Что сейчас тренируем, чтобы двинуть результат</h2>
            </div>
            {repeatCount > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Повтор: {repeatCount}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {roadmap.homeSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-[1.4rem] bg-slate-50/85 px-4 py-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Режим тренировки</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Как хочешь заниматься сегодня?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Выбери формат: приложение поведёт по слабым местам, даст точечную тренировку по типу задания или проверит тебя мини-вариантом.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/session"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("ege-trainer:selected-task-type");
                }
              }}
              className="block rounded-[1.65rem] border border-indigo-200 bg-[linear-gradient(135deg,#4f46e5,#7c3aed,#0ea5e9)] p-5 text-white shadow-[0_22px_55px_rgba(79,70,229,0.24)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/72">Слабые места</p>
                  <h3 className="mt-1 text-xl font-black">Ещё тренировка</h3>
                  <p className="mt-2 text-sm leading-6 text-white/84">
                    {focusTaskType ? `Сегодня лучший фокус — ${focusTaskType.toLowerCase()}.` : "Идём по тому, что сейчас сильнее всего мешает росту балла."}
                  </p>
                </div>
                <span className="rounded-full bg-white/16 px-3 py-1 text-sm font-bold">9 задач</span>
              </div>
            </Link>

            <Link
              href="/task-training"
              className="block rounded-[1.65rem] border border-slate-200 bg-slate-50/90 p-5 transition hover:bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Тип задания</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">Точечно прокачать навык</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Пунктуация, уравнения, экономика и другие типы — выбирай конкретный навык и тренируй его отдельно.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">Выбрать</span>
              </div>
            </Link>

            <Link
              href="/mini-variant"
              className="block rounded-[1.65rem] border border-indigo-200/80 bg-[linear-gradient(135deg,rgba(238,242,255,0.98),rgba(224,231,255,0.94))] p-5 shadow-[0_18px_45px_rgba(99,102,241,0.12)] transition hover:translate-y-[-1px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-500">Мини-вариант ЕГЭ</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">Проверить устойчивость и формат</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    12 задач подряд: проверка темпа, концентрации и готовности к более длинной работе.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">12 задач</span>
              </div>
            </Link>
          </div>

          {isPro ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              Pro: тренировки, мини-варианты и повтор ошибок доступны без дневных лимитов.
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 ring-1 ring-amber-200">
              Free даёт попробовать формат. Pro открывает систему: безлимитную практику, повтор ошибок и полный маршрут.
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.55rem] border border-white/70 bg-white/78 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Streak</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{streakDays}</p>
            <p className="mt-1 text-sm text-slate-500">дней подряд</p>
          </div>
          <div className="rounded-[1.55rem] border border-white/70 bg-white/78 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Сессий</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{sessionsCompleted}</p>
            <p className="mt-1 text-sm text-slate-500">завершено</p>
          </div>
        </div>

        <div className="bottom-nav">
          <div className="bottom-nav-grid">
            <Link href="/home" className="bottom-nav-link bottom-nav-link-active whitespace-nowrap">
              <span className="block leading-none">Главная</span>
            </Link>
            <Link href="/progress" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link href="/profile" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
