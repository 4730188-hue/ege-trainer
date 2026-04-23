"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDiagnosisResult,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  type DiagnosisResult,
  type SessionProgress,
  type StudentProfile,
} from "@/lib/storage";

export default function ProgressPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfile(getStudentProfile());
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject);
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const lastSessionCompletedAt = sessionProgress?.lastSessionCompletedAt
    ? new Date(sessionProgress.lastSessionCompletedAt).toLocaleDateString("ru-RU")
    : null;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const levelLabel = diagnosisResult?.levelLabel;
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

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Решено</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">48</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Верно</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">71%</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Сессий</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{sessionsCompleted}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Темы</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              текущий срез
            </span>
          </div>
          <div className="mt-4 space-y-3 text-base text-slate-700">
            <p>Сильная тема: Орфография</p>
            <p>Нужно закрепить: {weakTopics[0] ?? "Пунктуация"}</p>
            <p>Слабая тема: {weakTopics[1] ?? weakTopics[0] ?? "Лексика"}</p>
            {diagnosisResult?.completedDiagnosis && levelLabel && (
              <p>Уровень: {levelLabel}</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-base leading-7 text-slate-600">
            {diagnosisResult?.completedDiagnosis
              ? `Диагностика завершена${subjectLabel ? ` по предмету ${subjectLabel}` : ""}. ${levelLabel ? `Текущий уровень: ${levelLabel}. ` : ""}${sessionsCompleted > 0 ? `Сессий завершено: ${sessionsCompleted}. ` : ""}${lastSessionCompletedAt ? `Последняя сессия: ${lastSessionCompletedAt}.` : ""}`
              : `Ты стабильно двигаешься вверх. Сейчас главное, не бросать короткие ежедневные тренировки${lastSessionCompletedAt ? `. Последняя сессия была ${lastSessionCompletedAt}` : ""}.`}
          </p>
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
