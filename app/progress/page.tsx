"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getDiagnosisResult,
  getIncorrectQuestionCount,
  getSessionProgress,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  type DiagnosisResult,
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

export default function ProgressPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [repeatCount, setRepeatCount] = useState(0);

  useEffect(() => {
    const nextProfile = getStudentProfile();
    const subject = normalizeSubjectKey(nextProfile?.subject);

    setProfile(nextProfile);
    setDiagnosisResult(getDiagnosisResult());
    setSessionProgress(getSessionProgress());
    setRepeatCount(getIncorrectQuestionCount(subject));
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject);
  const sessionsCompleted = sessionProgress?.sessionsCompleted ?? 0;
  const streakDays = sessionProgress?.streakDays ?? 0;
  const lastActivityDate = sessionProgress?.lastActivityDate
    ? new Date(`${sessionProgress.lastActivityDate}T00:00:00`).toLocaleDateString("ru-RU")
    : null;
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const levelLabel = diagnosisResult?.levelLabel ?? "Пока нет";
  const diagnosisCompleted = Boolean(diagnosisResult?.completedDiagnosis);
  const note = useMemo(() => getSubjectProgressText(subjectLabel), [subjectLabel]);

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

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Сессий</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{sessionsCompleted}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">На повтор</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{repeatCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Уровень</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{levelLabel}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Streak</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{streakDays}</p>
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
            <p>Слабые темы: {weakTopics.length > 0 ? weakTopics.join(", ") : "пока не определены"}</p>
            <p>Последняя активность: {lastActivityDate ?? "пока нет"}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-500">Что это значит сейчас</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
          {repeatCount > 0 && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Следующие сессии будут стараться возвращать вопросы, в которых раньше были ошибки.
            </p>
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
