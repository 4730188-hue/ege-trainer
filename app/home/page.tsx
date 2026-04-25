"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildRoadmap,
  clearSelectedTaskType,
  getDiagnosisResult,
  getDueReviewEntries,
  getMiniVariantProgress,
  getRepeatInsight,
  getSelectedTaskType,
  getStudentProfile,
  getSubjectLabel,
  getTaskTypeMastery,
  getProPlanLabel,
  getProSubscription,
  getSessionProgress,
  normalizeSubjectKey,
  setSelectedTaskType,
  updateStudentSubject,
  type DiagnosisResult,
  type MiniVariantProgress,
  type ProSubscription,
  type SessionProgress,
  type StudentProfile,
  type WeakTaskTypeEntry,
} from "@/lib/storage";
import { getTaskTypeGuide, type SubjectKey, type TaskType } from "@/lib/questionBank";

const subjectOptions = [
  { key: "russian", label: "Русский язык", short: "Русский" },
  { key: "math", label: "Профильная математика", short: "Математика" },
  { key: "social", label: "Обществознание", short: "Общество" },
] as const;

function getSubjectAccent(subject: SubjectKey) {
  if (subject === "math") return "from-sky-600 via-blue-600 to-indigo-700";
  if (subject === "social") return "from-violet-600 via-fuchsia-600 to-indigo-700";
  return "from-indigo-600 via-violet-600 to-sky-600";
}

export default function HomePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [miniVariantProgress, setMiniVariantProgress] = useState<MiniVariantProgress | null>(null);
  const [repeatInsight, setRepeatInsight] = useState<ReturnType<typeof getRepeatInsight> | null>(null);
  const [proSubscription, setProSubscription] = useState<ProSubscription | null>(null);
  const [mastery, setMastery] = useState<ReturnType<typeof getTaskTypeMastery>>([]);
  const [dueReviews, setDueReviews] = useState(0);
  const [selectedTaskLabel, setSelectedTaskLabel] = useState<string | null>(null);

  function refresh(nextSubject?: SubjectKey) {
    const nextProfile = getStudentProfile();
    const subject = nextSubject ?? normalizeSubjectKey(nextProfile?.subject);
    setProfile(nextProfile);
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
    setMiniVariantProgress(getMiniVariantProgress());
    setRepeatInsight(getRepeatInsight(subject));
    setProSubscription(getProSubscription());
    setMastery(getTaskTypeMastery(subject));
    setDueReviews(getDueReviewEntries(subject).length);
    setSelectedTaskLabel(getSelectedTaskType(subject)?.label ?? null);
  }

  useEffect(() => {
    refresh();
  }, []);

  const subject = normalizeSubjectKey(profile?.subject);
  const subjectLabel = getSubjectLabel(subject);
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80+ баллов";
  const isPro = Boolean(proSubscription?.isPro);
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const streakDays = sessionProgress?.streakDays ?? 0;
  const completedMiniVariants = miniVariantProgress?.completedCount ?? 0;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const weakTask = repeatInsight?.weakTaskTypes?.[0] ?? mastery[0];
  const focusLabel = weakTask?.label ?? weakTopics[0] ?? "стартовая тренировка";

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

  const bestTaskType = (repeatInsight?.weakTaskTypes?.[0]?.taskType ?? mastery[0]?.taskType) as TaskType | undefined;
  const guide = getTaskTypeGuide(bestTaskType);

  const handleSubjectChange = (nextSubject: SubjectKey) => {
    updateStudentSubject(nextSubject);
    clearSelectedTaskType();
    refresh(nextSubject);
  };

  const handleWeakMode = () => {
    clearSelectedTaskType();
  };

  const handleAutoTaskType = () => {
    if (bestTaskType) {
      setSelectedTaskType(subject, bestTaskType, guide?.title ?? focusLabel);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 pb-24">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>EGE Trainer</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            {isPro ? getProPlanLabel(proSubscription?.activePlan) : "Free"}
          </span>
        </div>

        <section className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${getSubjectAccent(subject)} p-5 text-white shadow-[0_24px_60px_rgba(79,70,229,0.22)]`}>
          <div className="absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                Тренировочный маршрут
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{subjectLabel}</span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight">Не тестик, а личная система подготовки</h1>
            <p className="mt-3 text-sm leading-6 text-white/86">
              Сегодня работаем по циклу: короткий урок → практика → повтор ошибок → мини-вариант. Цель: {targetLabel}.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/14 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Сессии</p>
                <p className="mt-1 text-xl font-bold">{sessionsCompleted}</p>
              </div>
              <div className="rounded-2xl bg-white/14 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Повтор</p>
                <p className="mt-1 text-xl font-bold">{repeatInsight?.repeatCount ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/14 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Серия</p>
                <p className="mt-1 text-xl font-bold">{streakDays}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Предмет</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {subjectOptions.map((option) => {
              const active = option.key === subject;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSubjectChange(option.key)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                    active ? "bg-slate-950 text-white shadow-lg shadow-slate-300/50" : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {option.short}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[32px] border border-indigo-100 bg-white p-5 shadow-[0_18px_45px_rgba(79,70,229,0.08)]">
          <p className="text-sm font-medium text-slate-500">Режим тренировки</p>
          <h2 className="mt-1 text-3xl font-black leading-tight tracking-tight">Как хочешь заниматься сегодня?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Выбери формат: приложение поведёт по слабым местам, даст точечную тренировку по типу задания или проверит устойчивость мини-вариантом.
          </p>

          <div className="mt-5 space-y-3">
            <Link href="/session" onClick={handleWeakMode} className="block rounded-[26px] bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 p-5 text-white shadow-[0_18px_40px_rgba(79,70,229,0.24)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Слабые места</p>
                  <h3 className="mt-1 text-2xl font-black">Ещё тренировка</h3>
                  <p className="mt-2 text-sm leading-6 text-white/86">Лучший фокус сейчас: {focusLabel}. Сначала мини-урок, потом 9 заданий.</p>
                </div>
                <span className="rounded-full bg-white/16 px-3 py-1 text-sm font-bold">9</span>
              </div>
            </Link>

            <Link href="/task-training" onClick={handleAutoTaskType} className="block rounded-[26px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Тип задания</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">Точечно прокачать навык</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Выбери пунктуацию, уравнения, экономику или другой тип. Перед задачами будет короткий урок.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700 ring-1 ring-slate-200">Выбрать</span>
              </div>
            </Link>

            <Link href="/mini-variant" className="block rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Мини-вариант ЕГЭ</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">Проверить темп и устойчивость</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">12 заданий в экзаменационном режиме. Хорошо после 2–3 тренировок.</p>
                </div>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-sm font-bold text-slate-700 ring-1 ring-slate-200">12</span>
              </div>
            </Link>
          </div>

          <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${isPro ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
            {isPro
              ? "Pro активен: тренировки, типы заданий и мини-варианты доступны без дневных лимитов."
              : "Free даёт попробовать систему. Pro открывает безлимитный цикл подготовки: уроки, тренировки, повторы и мини-варианты."}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">План на сегодня</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{roadmap.homeStatus}</h2>
          <div className="mt-4 space-y-3">
            {roadmap.homeSteps.slice(0, 4).map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <p className="text-sm font-medium text-slate-500">Интервальный повтор</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{dueReviews}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">заданий пора вернуть сегодня</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
            <p className="text-sm font-medium text-slate-500">Выбранный навык</p>
            <p className="mt-2 text-lg font-black text-slate-950">{selectedTaskLabel ?? "по слабым местам"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">можно сменить в режиме «Тип задания»</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Освоение навыков</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Что сейчас прокачивать</h2>
          <div className="mt-4 space-y-3">
            {mastery.slice(0, 4).map((item) => (
              <div key={item.taskType} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700">{item.score}%</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-slate-950" style={{ width: `${item.score}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </section>

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
