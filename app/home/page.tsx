"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildReadiness,
  buildRoadmap,
  getDiagnosisResult,
  getExamTimelineLabel,
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

export default function HomePage() {
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
  const dailyLabel = profile?.dailyMinutes ? `${profile.dailyMinutes} минут в день` : null;
  const timelineLabel = getExamTimelineLabel(profile?.examTimeline);
  const levelLabel = diagnosisResult?.levelLabel ?? null;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const weakTopicsPreview = weakTopics.slice(0, 2).join(", ");
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const streakDays = sessionProgress?.streakDays ?? 0;
  const completedMiniVariants = miniVariantProgress?.completedCount ?? 0;
  const lastMiniResult = miniVariantProgress?.lastResult ?? null;
  const diagnosisStatus = diagnosisResult?.completedDiagnosis
    ? levelLabel
      ? `Пройдена, уровень ${levelLabel}`
      : "Пройдена"
    : "Не пройдена";

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

  return (
    <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>Учебный кабинет</span>
          <span className="rounded-full bg-indigo-100/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            Personal plan
          </span>
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

          <div className="mt-5 rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-medium text-indigo-100/84">Сегодняшний фокус</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {weakTopics.length > 0 ? weakTopics[0] : subjectLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-indigo-100/84">
              {weakTopicsPreview
                ? `Сильнее всего сейчас окупится работа по темам: ${weakTopicsPreview}.`
                : dailyLabel
                  ? `Держим реалистичный темп: ${dailyLabel}. Маленькая сессия сегодня важнее идеального плана завтра.`
                  : "Короткая сессия сегодня поможет удержать ритм и сделать прогресс осязаемым."}
            </p>
          </div>

          <Link
            href="/session"
            className="mt-5 block rounded-[1.6rem] bg-[linear-gradient(135deg,#312e81_0%,#4338ca_52%,#7c3aed_100%)] px-5 py-4 text-center text-base font-semibold text-white shadow-[0_22px_45px_rgba(79,70,229,0.32)] transition hover:translate-y-[-1px] hover:opacity-95"
          >
            <span className="block leading-none text-white">Начать тренировку</span>
          </Link>
        </section>

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
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Диагностика</p>
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
              <p className="text-sm font-medium text-slate-500">Твой следующий шаг</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Что двинет результат уже сегодня</h2>
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

        <Link
          href="/mini-variant"
          className="block rounded-[1.85rem] border border-indigo-200/80 bg-[linear-gradient(135deg,rgba(238,242,255,0.96),rgba(224,231,255,0.92))] p-5 shadow-[0_18px_45px_rgba(99,102,241,0.12)] transition hover:translate-y-[-1px]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Мини-вариант ЕГЭ</p>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">8 заданий</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Проверить себя ближе к реальному формату</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Короткий вариант по предмету, чтобы увидеть, как держится концентрация и темп на связке заданий.
          </p>
          <p className="mt-3 text-sm font-medium text-indigo-700">
            {lastMiniResult
              ? `Последний результат: ${lastMiniResult.correctAnswers ?? 0}/${lastMiniResult.totalQuestions ?? 8}. Завершено: ${completedMiniVariants}.`
              : "Пока ещё не запускал. Доступно 3 мини-варианта на предмет."}
          </p>
        </Link>

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

        <div className="mt-auto border-t border-white/70 pt-4 pb-6">
          <div className="grid grid-cols-3 items-center gap-2 text-sm">
            <Link
              href="/home"
              className="rounded-2xl bg-[linear-gradient(135deg,#312e81_0%,#4338ca_52%,#7c3aed_100%)] px-3 py-3 font-semibold text-white text-center shadow-[0_16px_30px_rgba(79,70,229,0.24)] whitespace-nowrap"
            >
              <span className="block leading-none">Главная</span>
            </Link>
            <Link
              href="/progress"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
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
