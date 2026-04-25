"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildParentWeeklyReport,
  buildReadiness,
  buildRoadmap,
  clearSelectedTaskType,
  getDiagnosisResult,
  getDueReviewEntries,
  getExamTimelineLabel,
  getMiniVariantProgress,
  getRepeatInsight,
  getTaskTypeMastery,
  getProPlanLabel,
  getProSubscription,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  type DiagnosisResult,
  type MiniVariantProgress,
  type ParentWeeklyReport,
  type ProSubscription,
  type SessionProgress,
  type StudentProfile,
} from "@/lib/storage";

function getToneClasses(tone: "indigo" | "green" | "amber") {
  if (tone === "green") return "border-emerald-100 bg-emerald-50/80 text-emerald-800";
  if (tone === "amber") return "border-amber-100 bg-amber-50/80 text-amber-800";
  return "border-indigo-100 bg-indigo-50/80 text-indigo-800";
}

export default function ProgressPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [miniVariantProgress, setMiniVariantProgress] = useState<MiniVariantProgress | null>(null);
  const [repeatInsight, setRepeatInsight] = useState<ReturnType<typeof getRepeatInsight> | null>(null);
  const [proSubscription, setProSubscription] = useState<ProSubscription | null>(null);
  const [mastery, setMastery] = useState<ReturnType<typeof getTaskTypeMastery>>([]);
  const [dueReviews, setDueReviews] = useState(0);

  useEffect(() => {
    const nextProfile = getStudentProfile();
    const subject = normalizeSubjectKey(nextProfile?.subject);
    setProfile(nextProfile);
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
    setMiniVariantProgress(getMiniVariantProgress());
    setRepeatInsight(getRepeatInsight(subject));
    setProSubscription(getProSubscription());
    setMastery(getTaskTypeMastery(subject));
    setDueReviews(getDueReviewEntries(subject).length);
  }, []);

  const subject = normalizeSubjectKey(profile?.subject);
  const subjectLabel = getSubjectLabel(subject);
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80+ баллов";
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const streakDays = sessionProgress?.streakDays ?? 0;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const completedMiniVariants = miniVariantProgress?.completedCount ?? 0;
  const lastMiniResult = miniVariantProgress?.lastResult ?? null;
  const isPro = Boolean(proSubscription?.isPro);
  const timelineLabel = getExamTimelineLabel(profile?.examTimeline);

  const roadmap = useMemo(
    () =>
      buildRoadmap({
        subjectLabel,
        weakTopics,
        sessionsCompleted,
        streakDays,
        diagnosisCompleted: Boolean(diagnosisResult?.completedDiagnosis),
        repeatCount: repeatInsight?.repeatCount ?? 0,
        completedMiniVariants,
      }),
    [subjectLabel, weakTopics, sessionsCompleted, streakDays, diagnosisResult, repeatInsight, completedMiniVariants],
  );

  const readiness = useMemo(
    () =>
      buildReadiness({
        targetLabel,
        diagnosisCompleted: Boolean(diagnosisResult?.completedDiagnosis),
        sessionsCompleted,
        streakDays,
        weakTopics,
        repeatCount: repeatInsight?.repeatCount ?? 0,
        completedMiniVariants,
        lastMiniCorrectAnswers: lastMiniResult?.correctAnswers,
        lastMiniTotalQuestions: lastMiniResult?.totalQuestions,
      }),
    [targetLabel, diagnosisResult, sessionsCompleted, streakDays, weakTopics, repeatInsight, completedMiniVariants, lastMiniResult],
  );

  const parentReport: ParentWeeklyReport = useMemo(
    () =>
      buildParentWeeklyReport({
        subjectLabel,
        targetLabel,
        sessionsCompleted,
        streakDays,
        weakTopics,
        repeatCount: repeatInsight?.repeatCount ?? 0,
        weakTaskTypes: repeatInsight?.weakTaskTypes ?? [],
        completedMiniVariants,
      }),
    [subjectLabel, targetLabel, sessionsCompleted, streakDays, weakTopics, repeatInsight, completedMiniVariants],
  );

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 pb-24">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Карта подготовки</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            {isPro ? getProPlanLabel(proSubscription?.activePlan) : "Free"}
          </span>
        </div>

        <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-900 to-violet-700 p-6 text-white shadow-[0_24px_60px_rgba(30,41,59,0.22)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Не просто статистика</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Твоя рабочая карта подготовки</h1>
          <p className="mt-3 text-sm leading-6 text-white/82">
            Здесь видно, что тренировать дальше, какие ошибки пора вернуть и как объяснить прогресс родителям.
          </p>
        </section>

        <section className="rounded-[32px] border border-indigo-100 bg-white p-5 shadow-[0_18px_45px_rgba(79,70,229,0.08)]">
          <p className="text-sm font-medium text-slate-500">Следующее действие</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Продолжи подготовку прямо отсюда</h2>
          <div className="mt-4 grid gap-3">
            <Link href="/session" onClick={() => clearSelectedTaskType()} className="rounded-[24px] bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-4 text-center text-base font-bold text-white">
              Ещё тренировка
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/task-training" className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-bold text-slate-800">
                Тип задания
              </Link>
              <Link href="/mini-variant" className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-center text-sm font-bold text-slate-800 shadow-sm">
                Мини-вариант
              </Link>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {isPro ? "Pro активен: можно тренироваться без дневных лимитов." : "В Free есть дневной лимит. Pro открывает полный цикл подготовки без пауз."}
          </p>
        </section>

        <section className={`rounded-3xl border p-5 shadow-sm shadow-slate-200/40 ${getToneClasses(readiness.tone)}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Готовность сейчас</p>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{readiness.statusLabel}</span>
          </div>
          <p className="mt-3 text-sm leading-6">{readiness.closenessText}</p>
          <div className="mt-4 rounded-2xl bg-white/70 p-4">
            <p className="text-sm font-bold">Что мешает дойти до цели</p>
            <div className="mt-2 space-y-2 text-sm">
              {readiness.blockers.map((item) => <p key={item}>• {item}</p>)}
            </div>
            <p className="mt-3 text-sm font-semibold">Следующий фокус</p>
            <p className="mt-1 text-sm leading-6">{readiness.nextFocus}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Сессий</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{sessionsCompleted}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">На повтор</p>
            <p className="mt-2 text-3xl font-black text-amber-700">{repeatInsight?.repeatCount ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Пора вернуть</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{dueReviews}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Streak</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{streakDays}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Освоение по типам заданий</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Где сейчас максимальный рост</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{subjectLabel}</span>
          </div>
          <div className="mt-4 space-y-3">
            {mastery.slice(0, 6).map((item) => (
              <div key={item.taskType} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700">{item.score}%</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-slate-950" style={{ width: `${item.score}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.status}{item.errors > 0 ? ` · ошибок: ${item.errors}` : ""}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-500">Тренировочный маршрут</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{roadmap.homeStatus}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{roadmap.progressSummary}</p>
          <div className="mt-4 space-y-3">
            {roadmap.homeSteps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm shadow-emerald-100/50">
          <p className="text-sm font-medium text-emerald-700">Для родителя</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{parentReport.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{parentReport.summary}</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-white/75 p-4">
              <p className="text-sm font-bold text-slate-950">Что уже есть</p>
              {parentReport.wins.map((item) => <p key={item} className="mt-2 text-sm text-slate-600">• {item}</p>)}
            </div>
            <div className="rounded-2xl bg-white/75 p-4">
              <p className="text-sm font-bold text-slate-950">Что делать на неделе</p>
              {parentReport.nextWeek.map((item) => <p key={item} className="mt-2 text-sm text-slate-600">• {item}</p>)}
            </div>
          </div>
        </section>

        {timelineLabel && (
          <p className="text-center text-xs text-slate-400">Срок до экзамена: {timelineLabel}</p>
        )}

        <div className="bottom-nav">
          <div className="bottom-nav-grid">
            <Link href="/home" className="bottom-nav-link whitespace-nowrap"><span className="block leading-none">Главная</span></Link>
            <Link href="/progress" className="bottom-nav-link bottom-nav-link-active whitespace-nowrap"><span className="block leading-none">Прогресс</span></Link>
            <Link href="/profile" className="bottom-nav-link whitespace-nowrap"><span className="block leading-none">Профиль</span></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
