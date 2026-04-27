"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopMenu from "@/app/components/TopMenu";
import {
  clearAppState,
  getProPlanLabel,
  getProSubscription,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  updateStudentSubject,
  type ProSubscription,
  type StudentProfile,
} from "@/lib/storage";
import type { SubjectKey } from "@/lib/questionBank";

const subjects: Array<{ key: SubjectKey; label: string; short: string }> = [
  { key: "russian", label: "Русский язык", short: "Русский" },
  { key: "math", label: "Профильная математика", short: "Математика" },
  { key: "social", label: "Обществознание", short: "Общество" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);

  function refresh(nextSubject?: SubjectKey) {
    const nextProfile = getStudentProfile();
    setProfile(nextSubject ? { ...nextProfile, subject: getSubjectLabel(nextSubject) } : nextProfile);
    setSubscription(getProSubscription());
  }

  useEffect(() => {
    refresh();
  }, []);

  const subject = normalizeSubjectKey(profile?.subject);
  const isPro = Boolean(subscription?.isPro);

  const handleSubject = (next: SubjectKey) => {
    updateStudentSubject(next);
    refresh(next);
  };

  const handleReset = () => {
    clearAppState();
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle="профиль" />

      <div className="mx-auto w-full max-w-md space-y-8 pt-7">
        <section>
          <p className="text-sm text-slate-500">настройки подготовки</p>
          <h1 className="mt-2 text-[2.35rem] font-black leading-[1.04] tracking-[-0.055em]">Профиль</h1>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Текущий план</h2>
          <div className="mt-4 space-y-3 text-base text-slate-700">
            <p>Предмет: <span className="font-semibold text-slate-950">{getSubjectLabel(subject)}</span></p>
            <p>Цель: <span className="font-semibold text-slate-950">{profile?.targetScore ?? "80+"} баллов</span></p>
            <p>В день: <span className="font-semibold text-slate-950">{profile?.dailyMinutes ?? "30+"} минут</span></p>
            <p>Тариф: <span className="font-semibold text-slate-950">{isPro ? getProPlanLabel(subscription?.activePlan) : "Free"}</span></p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Предмет</h2>
          <div className="mt-4 space-y-2">
            {subjects.map((item) => {
              const active = item.key === subject;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSubject(item.key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left font-semibold transition ${active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-800"}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-blue-100 bg-blue-50/75 p-6">
          <h2 className="text-xl font-bold tracking-[-0.035em]">{isPro ? "Pro активен" : "Free-режим"}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isPro ? "Полный режим подготовки включён." : "Free подходит для старта. Pro открывает безлимитную практику и полный маршрут."}
          </p>
          {!isPro && <Link href="/paywall" className="mt-5 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-semibold text-white">Посмотреть Pro</Link>}
        </section>

        <button type="button" onClick={handleReset} className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-semibold text-slate-700">
          Сбросить локальные данные
        </button>
      </div>
    </main>
  );
}
