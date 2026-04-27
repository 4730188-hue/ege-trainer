"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopMenu from "@/app/components/TopMenu";
import { getTaskTypeGuide, type SubjectKey, type TaskType } from "@/lib/questionBank";
import {
  clearSelectedTaskType,
  getDiagnosisResult,
  getMiniVariantProgress,
  getProSubscription,
  getRepeatInsight,
  getSelectedTaskType,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  getTaskTypeMastery,
  normalizeSubjectKey,
  setSelectedTaskType,
  updateStudentSubject,
  type DiagnosisResult,
  type MiniVariantProgress,
  type ProSubscription,
  type SessionProgress,
  type StudentProfile,
} from "@/lib/storage";

const subjectOptions = [
  { key: "russian", label: "Русский язык", short: "Русский" },
  { key: "math", label: "Профильная математика", short: "Математика" },
  { key: "social", label: "Обществознание", short: "Общество" },
] as const;

export default function HomePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [session, setSession] = useState<SessionProgress | null>(null);
  const [miniProgress, setMiniProgress] = useState<MiniVariantProgress | null>(null);
  const [pro, setPro] = useState<ProSubscription | null>(null);
  const [mastery, setMastery] = useState<ReturnType<typeof getTaskTypeMastery>>([]);
  const [repeat, setRepeat] = useState<ReturnType<typeof getRepeatInsight> | null>(null);

  function refresh(nextSubject?: SubjectKey) {
    const nextProfile = getStudentProfile();
    const subject = nextSubject ?? normalizeSubjectKey(nextProfile?.subject);
    setProfile(nextProfile);
    setDiagnosis(getDiagnosisResult());
    setSession(getSessionProgress());
    setMiniProgress(getMiniVariantProgress());
    setPro(getProSubscription());
    setMastery(getTaskTypeMastery(subject));
    setRepeat(getRepeatInsight(subject));
  }

  useEffect(() => {
    refresh();
  }, []);

  const subject = normalizeSubjectKey(profile?.subject);
  const subjectLabel = getSubjectLabel(subject);
  const target = profile?.targetScore ? `${profile.targetScore}+` : "80+";
  const isPro = Boolean(pro?.isPro);
  const sessionsCompleted = session?.sessionsCompleted ?? 0;
  const streakDays = session?.streakDays ?? 0;
  const repeatCount = repeat?.repeatCount ?? 0;
  const weakTask = repeat?.weakTaskTypes?.[0] ?? mastery[0];
  const focusLabel = weakTask?.label ?? diagnosis?.weakTopics?.[0] ?? "стартовый навык";
  const bestTaskType = (weakTask?.taskType ?? mastery[0]?.taskType) as TaskType | undefined;
  const guide = getTaskTypeGuide(bestTaskType);

  const subtitle = `${subjectLabel} · цель ${target}`;

  const nextRecommendation = useMemo(() => {
    if (!diagnosis?.completedDiagnosis) return "Собрать стартовый срез";
    if (repeatCount > 0) return `Закрыть повтор: ${repeatCount}`;
    return guide?.title ? `Прокачать: ${guide.title}` : `Фокус: ${focusLabel}`;
  }, [diagnosis?.completedDiagnosis, repeatCount, guide?.title, focusLabel]);

  const handleSubjectChange = (nextSubject: SubjectKey) => {
    updateStudentSubject(nextSubject);
    clearSelectedTaskType();
    refresh(nextSubject);
  };

  const handleWeakTraining = () => {
    clearSelectedTaskType();
  };

  const handleTaskTraining = () => {
    if (bestTaskType) setSelectedTaskType(subject, bestTaskType, guide?.title ?? focusLabel);
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle={subtitle} />

      <div className="mx-auto w-full max-w-md space-y-8 pt-7">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Предмет</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {subjectOptions.map((item) => {
              const active = item.key === subject;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSubjectChange(item.key)}
                  className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    active ? "border-blue-600 bg-white text-blue-700 shadow-sm" : "border-slate-200 bg-white/70 text-slate-700"
                  }`}
                >
                  {item.short}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-3xl text-blue-600">◎</div>
          <h1 className="text-[2.35rem] font-black leading-[1.03] tracking-[-0.055em] text-slate-950">
            Твой план<br />на сегодня
          </h1>
          <p className="mt-4 text-lg leading-7 text-slate-500">1 шаг до сильной тренировки</p>

          <div className="my-6 h-px bg-slate-200" />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-slate-700">
            <span>{sessionsCompleted} сессий</span>
            <span className="text-slate-300">•</span>
            <span>streak {streakDays} дн.</span>
            <span className="text-slate-300">•</span>
            <span>повтор {repeatCount}</span>
          </div>

          <div className="mt-7 space-y-3">
            <Link href="/session" onClick={handleWeakTraining} className="block rounded-2xl bg-blue-600 px-5 py-4 text-center text-lg font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,0.22)]">
              Продолжить тренировку →
            </Link>
            <Link href="/mini-variant" className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-lg font-semibold text-slate-950">
              Открыть мини-вариант →
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.035em]">1. Следующий шаг</h2>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">✦</div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-950">Рекомендуем: {nextRecommendation}</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">{focusLabel} · 9 заданий с коротким мини-уроком</p>
              </div>
            </div>
            <Link href="/session" onClick={handleWeakTraining} className="mt-5 block rounded-2xl bg-blue-600 px-5 py-4 text-center text-base font-semibold text-white">
              Начать
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-[-0.035em]">2. Быстрый доступ</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/task-training" onClick={handleTaskTraining} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">◎</div>
              <div className="mt-3 text-base font-semibold leading-5">Тренировка<br />по типам</div>
            </Link>
            <Link href="/mini-variant" className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">□</div>
              <div className="mt-3 text-base font-semibold leading-5">Мини-<br />вариант</div>
            </Link>
          </div>
        </section>

        <Link href="/paywall" className="flex items-center justify-between rounded-[1.5rem] border border-blue-100 bg-blue-50/80 px-5 py-4 text-blue-800">
          <div>
            <div className="font-semibold">{isPro ? "Pro активен" : "Pro: безлимитные тренировки"}</div>
            <div className="mt-1 text-sm text-blue-700/70">полный маршрут, повторы и разборы</div>
          </div>
          <span className="text-2xl">→</span>
        </Link>
      </div>
    </main>
  );
}
