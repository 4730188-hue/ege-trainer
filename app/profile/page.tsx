"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAppState,
  getExamTimelineLabel,
  getStudentProfile,
  getSubjectLabel,
  type StudentProfile,
} from "@/lib/storage";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfile(getStudentProfile());
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject) ?? "Русский язык";
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80 баллов";
  const dailyLabel = profile?.dailyMinutes ? `${profile.dailyMinutes} минут` : null;
  const timelineLabel = getExamTimelineLabel(profile?.examTimeline);

  const handleReset = () => {
    clearAppState();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Аккаунт</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Профиль
          </span>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Профиль</h1>
          <div className="mt-5 space-y-3 rounded-3xl bg-slate-50 p-4 text-base text-slate-700">
            <p>Предмет: {subjectLabel}</p>
            <p>Цель: {targetLabel}</p>
            {dailyLabel && <p>В день: {dailyLabel}</p>}
            {timelineLabel && <p>Экзамен: {timelineLabel}</p>}
            <p>Тариф: Pro</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="primary-cta"
          >
            <span className="block leading-none text-white">Настроить уведомления</span>
          </Link>
          <Link
            href="/profile"
            className="primary-cta"
          >
            <span className="block leading-none text-white">Управление подпиской</span>
          </Link>
          <Link
            href="/profile"
            className="primary-cta"
          >
            <span className="block leading-none text-white">Написать в поддержку</span>
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="secondary-cta"
          >
            Начать заново
          </button>
        </div>

        <div className="bottom-nav">
          <div className="bottom-nav-grid">
            <Link
              href="/home"
              className="bottom-nav-link whitespace-nowrap"
            >
              <span className="block leading-none">Главная</span>
            </Link>
            <Link
              href="/progress"
              className="bottom-nav-link whitespace-nowrap"
            >
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link
              href="/profile"
              className="bottom-nav-link bottom-nav-link-active whitespace-nowrap"
            >
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
