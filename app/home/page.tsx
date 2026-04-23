"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getExamTimelineLabel,
  getStudentProfile,
  getSubjectLabel,
  type StudentProfile,
} from "@/lib/storage";

export default function HomePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfile(getStudentProfile());
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject) ?? "Русский язык";
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80 баллов";
  const dailyLabel = profile?.dailyMinutes ? `${profile.dailyMinutes} минут в день` : null;
  const timelineLabel = getExamTimelineLabel(profile?.examTimeline);

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Учебный кабинет</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Mini App
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">Подготовка к ЕГЭ</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
            Твоя подготовка к ЕГЭ
          </h1>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Цель</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{targetLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Предмет: {subjectLabel}</p>
            {dailyLabel && (
              <p className="mt-1 text-sm leading-6 text-slate-600">В день: {dailyLabel}</p>
            )}
            {timelineLabel && (
              <p className="mt-1 text-sm leading-6 text-slate-600">Экзамен: {timelineLabel}</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm shadow-slate-300/50">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-300">Сессия на сегодня</p>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200">
              {profile?.dailyMinutes ? `${profile.dailyMinutes} мин` : "7 минут"}
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold leading-tight">{subjectLabel}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {dailyLabel
              ? `Держим темп: ${dailyLabel}. Небольшая тренировка поможет не потерять ритм.`
              : "Короткая тренировка, чтобы закрепить прогресс и не потерять ритм."}
          </p>
          <Link
            href="/session"
            className="mt-5 block rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold transition hover:opacity-95"
          >
            <span className="block leading-none text-white">Начать сессию</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">Предмет</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{subjectLabel}</p>
            <p className="mt-1 text-sm text-slate-500">текущий профиль</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">В день</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {profile?.dailyMinutes ?? "15"}
            </p>
            <p className="mt-1 text-sm text-slate-500">минут на подготовку</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-500">Сегодня в фокусе</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{subjectLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profile?.targetScore
              ? `Двигаемся к цели ${profile.targetScore} баллов спокойным темпом.`
              : "Повторим сложные случаи с запятыми в сложных предложениях."}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Прогноз</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              стабильно
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900">{targetLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {dailyLabel
              ? `Если продолжишь заниматься по ${dailyLabel}, цель выглядит реалистично.`
              : "Если продолжишь заниматься в таком темпе, цель выглядит реалистично."}
          </p>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 pb-6">
          <div className="grid grid-cols-3 gap-2 text-sm items-center">
            <Link
              href="/home"
              className="rounded-2xl border border-slate-900 bg-white px-3 py-3 font-semibold text-slate-900 text-center whitespace-nowrap"
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
