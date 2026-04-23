"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildReadiness,
  buildRoadmap,
  getDiagnosisResult,
  getIncorrectQuestionCount,
  getMiniVariantProgress,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  type DiagnosisResult,
  type MiniVariantProgress,
  type SessionProgress,
  type StudentProfile,
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

  useEffect(() => {
    const nextProfile = getStudentProfile();
    const subject = normalizeSubjectKey(nextProfile?.subject);

    setProfile(nextProfile);
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
    setMiniVariantProgress(getMiniVariantProgress());
    setRepeatCount(getIncorrectQuestionCount(subject));
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

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Аналитика</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Прогресс
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Твой прогресс</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Здесь собраны основные показатели по текущей подготовке.
          </p>
        </div>

        <div className={`rounded-3xl border p-5 shadow-sm shadow-slate-200/40 ${readinessTone.card}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Готовность сейчас</p>
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
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">На повтор</p>
            <p className={`mt-2 text-2xl font-bold ${repeatCount > 0 ? "text-amber-700" : "text-slate-900"}`}>{repeatCount}</p>
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
            <p className="text-sm font-medium text-slate-500">Текущий срез</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {subjectLabel}
            </span>
          </div>
          <div className="mt-4 space-y-3 text-base text-slate-700">
            <p>Диагностика: {diagnosisCompleted ? "пройдена" : "пока не пройдена"}</p>
            <p className={weakTopics.length > 0 ? "text-amber-700" : "text-slate-700"}>
              Слабые темы: {weakTopics.length > 0 ? weakTopics.join(", ") : "пока не определены"}
            </p>
            <p>Последняя активность: {lastActivityDate ?? "пока нет"}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-500">Дорожная карта</p>
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
          <p className="text-sm font-medium text-slate-500">Мини-варианты ЕГЭ</p>
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
          <p className="text-sm font-medium text-slate-500">Что это значит сейчас</p>
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

        <div className="mt-auto border-t border-slate-100 pt-4 pb-6">
          <div className="grid grid-cols-3 gap-2 text-sm items-center">
            <Link
              href="/home"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Главная</span>
            </Link>
            <Link
              href="/progress"
              className="rounded-2xl border border-slate-900 bg-white px-3 py-3 font-semibold text-slate-900 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link
              href="/profile"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
