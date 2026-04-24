"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildReadiness,
  buildRoadmap,
  getDiagnosisResult,
  getFreeGateStatus,
  getIncorrectQuestionCount,
  getMiniVariantProgress,
  getRepeatInsight,
  getWeakTaskTypes,
  getProPlanLabel,
  getProSubscription,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  type DiagnosisResult,
  type FreeGateStatus,
  type MiniVariantProgress,
  type ProSubscription,
  type SessionProgress,
  type StudentProfile,
  type WeakTaskTypeEntry,
} from "@/lib/storage";

function getSubjectProgressText(subjectLabel: string) {
  if (subjectLabel === "Профильная математика") {
    return "В математике особенно хорошо работает связка из коротких сессий, повтора ошибок и возврата к формулам.";
  }

  if (subjectLabel === "Обществознание") {
    return "В обществознании прогресс растёт, когда регулярно повторяешь термины и тренируешь узнавание логики задания.";
  }

  return "В русском языке быстрый прогресс обычно приходит через стабильный повтор орфографии, пунктуации и работы с текстом.";
}

function getToneClasses(tone: "indigo" | "green" | "amber") {
  if (tone === "green") {
    return {
      card: "border-emerald-100 bg-emerald-50/80",
      badge: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
    };
  }

  if (tone === "amber") {
    return {
      card: "border-amber-100 bg-amber-50/80",
      badge: "bg-amber-100 text-amber-700",
      text: "text-amber-700",
    };
  }

  return {
    card: "border-indigo-100 bg-indigo-50/80",
    badge: "bg-indigo-100 text-indigo-700",
    text: "text-indigo-700",
  };
}

export default function ProgressPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [miniVariantProgress, setMiniVariantProgress] = useState<MiniVariantProgress | null>(null);
  const [repeatCount, setRepeatCount] = useState(0);
  const [weakTaskTypes, setWeakTaskTypes] = useState<WeakTaskTypeEntry[]>([]);
  const [ordinaryErrorCount, setOrdinaryErrorCount] = useState(0);
  const [persistentWeaknessCount, setPersistentWeaknessCount] = useState(0);
  const [proSubscription, setProSubscription] = useState<ProSubscription | null>(null);
  const [sessionGate, setSessionGate] = useState<FreeGateStatus | null>(null);
  const [miniVariantGate, setMiniVariantGate] = useState<FreeGateStatus | null>(null);

  useEffect(() => {
    const nextProfile = getStudentProfile();
    const subject = normalizeSubjectKey(nextProfile?.subject);

    setProfile(nextProfile);
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
    setMiniVariantProgress(getMiniVariantProgress());
    setRepeatCount(getIncorrectQuestionCount(subject));
    const repeatInsight = getRepeatInsight(subject);
    setWeakTaskTypes(getWeakTaskTypes(subject));
    setOrdinaryErrorCount(repeatInsight.ordinaryErrorCount);
    setPersistentWeaknessCount(repeatInsight.persistentWeaknessCount);
    setProSubscription(getProSubscription());
    setSessionGate(getFreeGateStatus("session"));
    setMiniVariantGate(getFreeGateStatus("miniVariant"));
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject);
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80 баллов";
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const streakDays = sessionProgress?.streakDays ?? 0;
  const lastActivityDate = sessionProgress?.lastActivityDate
    ? new Date(`${sessionProgress.lastActivityDate}T00:00:00`).toLocaleDateString("ru-RU")
    : null;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const levelLabel = diagnosisResult?.levelLabel ?? "Пока нет";
  const diagnosisCompleted = Boolean(diagnosisResult?.completedDiagnosis);
  const note = useMemo(() => getSubjectProgressText(subjectLabel), [subjectLabel]);
  const completedMiniVariants = miniVariantProgress?.completedCount ?? 0;
  const lastMiniResult = miniVariantProgress?.lastResult ?? null;

  const roadmap = useMemo(
    () =>
      buildRoadmap({
        subjectLabel,
        weakTopics,
        sessionsCompleted,
        streakDays,
        diagnosisCompleted,
        repeatCount,
        completedMiniVariants,
      }),
    [subjectLabel, weakTopics, sessionsCompleted, streakDays, diagnosisCompleted, repeatCount, completedMiniVariants],
  );

  const readiness = useMemo(
    () =>
      buildReadiness({
        targetLabel,
        diagnosisCompleted,
        sessionsCompleted,
        streakDays,
        weakTopics,
        repeatCount,
        completedMiniVariants,
        lastMiniCorrectAnswers: lastMiniResult?.correctAnswers,
        lastMiniTotalQuestions: lastMiniResult?.totalQuestions,
      }),
    [targetLabel, diagnosisCompleted, sessionsCompleted, streakDays, weakTopics, repeatCount, completedMiniVariants, lastMiniResult],
  );

  const stageLabel =
    roadmap.progressStage === "advanced"
      ? "Продвинулся"
      : roadmap.progressStage === "in_progress"
        ? "В процессе"
        : "Новичок";

  const readinessTone = getToneClasses(readiness.tone);
  const isPro = Boolean(proSubscription?.isPro);
  const blockedFeature = sessionGate?.isBlocked ? "session" : miniVariantGate?.isBlocked ? "miniVariant" : null;

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Аналитика</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            {isPro ? "Pro активирован" : "Free"}
          </span>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Твой тренировочный профиль</h1>
          <p className="mt-3 text-sm helper-text">
            Здесь собраны основные показатели по текущему тренировочному процессу. Смотри на тренд, а не на одну цифру.
          </p>
        </div>

        {isPro ? (
          <div className="rounded-3xl border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(220,252,231,0.9))] p-5 shadow-sm shadow-emerald-100/60">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">Pro активирован</p>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {getProPlanLabel(proSubscription?.activePlan)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Расширенный режим уже включён локально. Можно отслеживать тренировочную динамику, идти по roadmap и не упираться в лимиты сессий и мини-вариантов.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Free vs Pro</p>
                <p className="mt-1 text-xl font-bold text-slate-900">Часть аналитики уже собрана, Pro делает её рабочим маршрутом</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {blockedFeature ? "Лимит достигнут" : "Можно усилить"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {blockedFeature
                ? `Сегодня Free уже упёрся в лимит на ${blockedFeature === "session" ? "сессию" : "мини-вариант"}. При этом уже видно, где именно просадка: ${weakTaskTypes[0]?.label ?? weakTopics[0] ?? "по текущим ошибкам"}.`
                : `Уже видно, какие темы и типы заданий требуют внимания. Pro нужен не ради статуса, а чтобы не прерывать движение к ${targetLabel}.`}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Что уже есть в Free</p>
                <div className="mt-2 space-y-2 text-slate-600">
                  <p>• Базовая аналитика</p>
                  <p>• Видно слабые темы и повтор</p>
                  <p>• Ограничение по дневным запускам</p>
                </div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="font-semibold text-slate-900">Что добавит Pro</p>
                <div className="mt-2 space-y-2 text-slate-700">
                  <p>• Безлимитные session и mini-variant</p>
                  <p>• Расширенный progress и понятный roadmap</p>
                  <p>• Спокойное движение к целевому баллу</p>
                </div>
              </div>
            </div>
            <Link href="/paywall" className="primary-cta mt-5">
              <span className="block leading-none text-white">Открыть Pro</span>
            </Link>
          </div>
        )}

        <div className={`rounded-3xl border p-5 shadow-sm shadow-slate-200/40 ${readinessTone.card}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Текущий тренировочный фокус</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${readinessTone.badge}`}>
              {readiness.statusLabel}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{readiness.closenessText}</p>
          <div className="mt-4 rounded-2xl bg-white/70 p-4">
            <p className="text-sm font-medium text-slate-900">Что мешает дойти до цели</p>
            <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
              {readiness.blockers.length > 0 ? (
                readiness.blockers.map((item) => <p key={item}>• {item}</p>)
              ) : (
                <p>Сейчас критичных блокеров не видно, главное не терять темп.</p>
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-slate-900">Следующий фокус</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{readiness.nextFocus}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Сессий</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{sessionsCompleted}</p>
            {!isPro && <p className="mt-1 text-xs text-slate-500">Сегодня: {sessionGate?.count ?? 0}/{sessionGate?.limit ?? 1}</p>}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">На повтор</p>
            <p className={`mt-2 text-2xl font-bold ${repeatCount > 0 ? "text-amber-700" : "text-slate-900"}`}>{repeatCount}</p>
            {!isPro && <p className="mt-1 text-xs text-slate-500">Mini-variant: {miniVariantGate?.count ?? 0}/{miniVariantGate?.limit ?? 1}</p>}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Уровень</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{levelLabel}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Streak</p>
            <p className={`mt-2 text-2xl font-bold ${streakDays >= 4 ? "text-emerald-700" : "text-slate-900"}`}>{streakDays}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Стартовый срез и текущая форма</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {subjectLabel}
            </span>
          </div>
          <div className="mt-4 space-y-3 text-base text-slate-700">
            <p>Стартовый срез: {diagnosisCompleted ? "собран" : "пока не собран"}</p>
            <p className={weakTopics.length > 0 ? "text-amber-700" : "text-slate-700"}>
              Слабые темы: {weakTopics.length > 0 ? weakTopics.join(", ") : "пока не определены"}
            </p>
            <p>Последняя активность: {lastActivityDate ?? "пока нет"}</p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Повторы и западающие зоны</p>
            <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
              <p>Вопросы на повтор: {repeatCount > 0 ? repeatCount : "пока нет"}</p>
              <p>Обычные ошибки: {ordinaryErrorCount}</p>
              <p className={persistentWeaknessCount > 0 ? "text-amber-700" : "text-slate-600"}>
                Зоны, которые западают: {persistentWeaknessCount > 0 ? persistentWeaknessCount : "пока не выделяются"}
              </p>
            </div>
            {weakTaskTypes.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {weakTaskTypes.slice(0, 3).map((entry) => (
                  <span key={entry.taskType} className={`rounded-full px-3 py-1 text-xs font-semibold ${entry.isWeakness ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                    {entry.label} · {entry.count}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">Пока недостаточно ошибок, чтобы уверенно выделить слабый тип задания.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Тренировочный маршрут</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
              {isPro ? "Полная" : "Доступна в Pro глубже"}
            </span>
          </div>
          <p className={`mt-2 text-lg font-semibold ${readinessTone.text}`}>{stageLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{roadmap.progressSummary}</p>
          <div className="mt-3 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Что дальше</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{roadmap.nextFocus}</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {roadmap.homeSteps.slice(0, 3).map((step) => (
                <p key={step}>• {step}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Мини-варианты ЕГЭ</p>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {isPro ? "без лимита" : "1 запуск в день"}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <p>Завершено: {completedMiniVariants}</p>
            {lastMiniResult ? (
              <p>
                Последний результат: {getSubjectLabel(lastMiniResult.subject)}, вариант {lastMiniResult.variantNumber}, {lastMiniResult.correctAnswers}/{lastMiniResult.totalQuestions}.
              </p>
            ) : (
              <p>Пока ещё нет результатов. Можно запустить первый мини-вариант с главной.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-500">Что сейчас тренируем</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
          {repeatCount > 0 && (
            <div className="mt-3 rounded-2xl bg-amber-50/80 p-4">
              <p className="text-sm font-medium text-amber-700">Как работает повтор</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Приложение возвращает вопросы с ошибками в следующие сессии, чтобы ты видел повтор именно там, где пока есть просадка.
              </p>
            </div>
          )}
        </div>

        <div className="bottom-nav">
          <div className="bottom-nav-grid">
            <Link href="/home" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Главная</span>
            </Link>
            <Link href="/progress" className="bottom-nav-link bottom-nav-link-active whitespace-nowrap">
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
