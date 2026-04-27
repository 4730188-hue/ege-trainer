"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopMenu from "@/app/components/TopMenu";
import {
  buildParentWeeklyReport,
  clearSelectedTaskType,
  getDiagnosisResult,
  getDueReviewEntries,
  getMiniVariantProgress,
  getRepeatInsight,
  setReviewMode,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  getTaskTypeMastery,
  normalizeSubjectKey,
  type DiagnosisResult,
  type MiniVariantProgress,
  type SessionProgress,
  type StudentProfile,
} from "@/lib/storage";

export default function ProgressPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [session, setSession] = useState<SessionProgress | null>(null);
  const [mini, setMini] = useState<MiniVariantProgress | null>(null);
  const [repeat, setRepeat] = useState<ReturnType<typeof getRepeatInsight> | null>(null);
  const [mastery, setMastery] = useState<ReturnType<typeof getTaskTypeMastery>>([]);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const nextProfile = getStudentProfile();
    const subject = normalizeSubjectKey(nextProfile?.subject);
    setProfile(nextProfile);
    setDiagnosis(getDiagnosisResult());
    setSession(getSessionProgress());
    setMini(getMiniVariantProgress());
    setRepeat(getRepeatInsight(subject));
    setMastery(getTaskTypeMastery(subject));
    setDueCount(getDueReviewEntries(subject).length);
  }, []);

  const subject = normalizeSubjectKey(profile?.subject);
  const subjectLabel = getSubjectLabel(subject);
  const target = profile?.targetScore ? `${profile.targetScore}+` : "80+";
  const weakItems = (repeat?.weakTaskTypes?.length ? repeat.weakTaskTypes : mastery).slice(0, 3);
  const sessions = session?.sessionsCompleted ?? 0;
  const repeatCount = repeat?.repeatCount ?? 0;
  const weakCount = weakItems.length;
  const parentReport = buildParentWeeklyReport({
    subjectLabel,
    targetLabel: target,
    sessionsCompleted: sessions,
    streakDays: session?.streakDays ?? 0,
    weakTopics: diagnosis?.weakTopics ?? [],
    repeatCount,
    weakTaskTypes: repeat?.weakTaskTypes ?? [],
    completedMiniVariants: mini?.completedCount ?? 0,
  });

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle={`${subjectLabel} · прогресс`} />

      <div className="mx-auto w-full max-w-md space-y-8 pt-7">
        <section>
          <p className="text-sm text-slate-500">Карта подготовки по формату ЕГЭ</p>
          <h1 className="mt-2 text-[2.35rem] font-black leading-[1.04] tracking-[-0.055em]">Твой прогресс</h1>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Сессий</p>
            <p className="mt-2 text-3xl font-black">{sessions}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Повтор</p>
            <p className="mt-2 text-3xl font-black">{repeatCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Зоны</p>
            <p className="mt-2 text-3xl font-black">{weakCount}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Что сейчас проседает</h2>
          <div className="mt-4 space-y-3">
            {weakItems.length > 0 ? (
              weakItems.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <span className="text-sm text-slate-500">{index + 1}</span>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-500">Слабые зоны появятся после нескольких тренировок.</p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Что делать дальше</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {dueCount > 0 ? `Сначала закрыть повтор: ${dueCount}.` : "Сделать тренировку и проверить себя мини-вариантом."}
          </p>
          <div className="mt-5 space-y-3">
  <Link href="/session" onClick={() => clearSelectedTaskType()} className="block rounded-2xl bg-blue-600 px-5 py-4 text-center font-semibold text-white">
    Тренировать слабые места
  </Link>
  <Link href="/session" onClick={() => setReviewMode(subject, "progress")} className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-semibold text-slate-950">
    Разобрать ошибки{repeatCount > 0 ? ` · ${repeatCount}` : ""}
  </Link>
  <Link href="/mini-variant" className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-semibold text-slate-950">
    Мини-вариант ЕГЭ
  </Link>
</div>
<div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
  Pro: безлимитные тренировки, типовые задания по формату ЕГЭ, разбор ошибок и мини-варианты без остановки.
</div>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-blue-50/75 p-6">
          <p className="text-sm font-semibold text-blue-700">Для родителя</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-slate-950">{parentReport.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{parentReport.summary}</p>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Риск:</span> {parentReport.risks[0]}</p>
            <p><span className="font-semibold">Неделя:</span> {parentReport.nextWeek[0]}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
