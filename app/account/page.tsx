"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearWebAccountUserId,
  getDiagnosisResult,
  getPaymentUserId,
  getProPlanLabel,
  getSubjectLabel,
  getStudentProfile,
  syncProSubscriptionFromServer,
  type DiagnosisResult,
  type ProSubscription,
} from "@/lib/storage";

type User = {
  id: string;
  email: string;
};

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getWeakTopics(diagnosis: DiagnosisResult | null) {
  if (!diagnosis?.weakTopics?.length) {
    return ["Пройдите диагностику, чтобы увидеть темы для повторения"];
  }

  return diagnosis.weakTopics.slice(0, 3);
}

function getSubjectScores(diagnosis: DiagnosisResult | null) {
  return diagnosis?.subjectScores ?? [];
}

function getSevenDayPlan(weakTopics: string[]) {
  const topics = weakTopics.length
    ? weakTopics
    : ["первая слабая тема", "вторая слабая тема", "третья слабая тема"];

  return [
    `День 1 — короткая тренировка по теме: ${topics[0]}`,
    `День 2 — повтор ошибок и похожие задания`,
    `День 3 — тренировка по теме: ${topics[1] || topics[0]}`,
    `День 4 — закрепление и проверка`,
    `День 5 — тренировка по теме: ${topics[2] || topics[0]}`,
    `День 6 — мини-вариант`,
    `День 7 — контрольный срез`,
  ];
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meResponse.json();

        if (!me.user) {
          window.location.href = "/login";
          return;
        }

        setUser(me.user);
        setDiagnosis(getDiagnosisResult());

        const sub = await syncProSubscriptionFromServer();
        setSubscription(sub);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    clearWebAccountUserId();
    window.location.href = "/login";
  }

  const isPro = Boolean(subscription?.isPro);
  const expiresAt = formatDate(subscription?.expiresAt);
  const profile = getStudentProfile();
  const subjectLabel = getSubjectLabel(profile?.subject);
  const weakTopics = useMemo(() => getWeakTopics(diagnosis), [diagnosis]);
  const subjectScores = useMemo(() => getSubjectScores(diagnosis), [diagnosis]);
  const sevenDayPlan = useMemo(() => getSevenDayPlan(weakTopics), [weakTopics]);
  const completedDiagnosis = Boolean(diagnosis?.completedDiagnosis);
  const correctAnswers = diagnosis?.correctAnswers ?? 0;
  const totalQuestions = diagnosis?.totalQuestions ?? 9;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] px-5 py-8 text-white">
        <div className="mx-auto max-w-md">
          <p className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            Загружаем кабинет...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <section className="bg-[#050816] px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-5xl">
          <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
            <Link href="/" className="flex items-center gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-black leading-none text-white">
                ЕГЭ
              </span>
              <span className="text-lg font-black">Plan</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-slate-200"
            >
              Выйти
            </button>
          </header>

          <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-300">
                Личный кабинет
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Подготовка к ЕГЭ в одном месте
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Здесь сохраняются диагностика, слабые темы, тренировки, Pro-доступ и план на ближайшие дни.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-slate-400">Аккаунт</p>
              <p className="mt-1 break-all text-lg font-black">{user?.email}</p>

              <div className="mt-5 rounded-2xl bg-white p-4 text-slate-950">
                <p className="text-sm font-bold text-blue-700">
                  {isPro ? "Pro активен" : "Free-доступ"}
                </p>
                <p className="mt-1 text-2xl font-black">
                  {isPro ? getProPlanLabel(subscription?.activePlan) : "День 1 бесплатно"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isPro
                    ? expiresAt
                      ? `Доступ действует до ${expiresAt}`
                      : "Полный режим подготовки включён."
                    : "Можно пройти диагностику и первую тренировку бесплатно."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Диагностика
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {completedDiagnosis ? "Результат сохранён" : "Начните с проверки по 3 предметам"}
                  </h2>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  {completedDiagnosis ? `${correctAnswers}/${totalQuestions}` : "7 минут"}
                </span>
              </div>

              {subjectScores.length ? (
                <div className="mt-5 grid gap-3">
                  {subjectScores.map((score) => {
                    const percent =
                      score.totalQuestions > 0
                        ? Math.round((score.correctAnswers / score.totalQuestions) * 100)
                        : 0;

                    return (
                      <div key={score.subject} className="rounded-2xl bg-slate-50 p-4">
                        <div className="mb-2 flex justify-between text-sm font-black">
                          <span>{score.label}</span>
                          <span>{score.correctAnswers}/{score.totalQuestions}</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-200">
                          <div
                            className="h-3 rounded-full bg-blue-600"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Диагностика покажет, какие темы стоит повторить по русскому, математике и обществознанию.
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/ege-diagnostic?source=account"
                  className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white"
                >
                  {completedDiagnosis ? "Пройти ещё раз" : "Пройти диагностику"}
                </Link>

                <Link
                  href="/result"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  Открыть результат
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
                Темы для повторения
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Что тренировать в первую очередь
              </h2>

              <div className="mt-5 grid gap-3">
                {weakTopics.map((topic, index) => (
                  <div
                    key={`${topic}-${index}`}
                    className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold leading-6 text-slate-800">{topic}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Следующий шаг
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {isPro ? "Продолжайте тренировку" : "День 1 открыт бесплатно"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isPro
                  ? "Можно тренироваться без ограничений, проходить мини-варианты и возвращать ошибки на повтор."
                  : "Сначала попробуйте одну короткую тренировку. После неё можно открыть план на 7 дней или месяц."}
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/task-training?source=account"
                  className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white"
                >
                  Начать тренировку
                </Link>

                {!isPro ? (
                  <Link
                    href="/paywall?source=account"
                    className="rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center font-black text-blue-700"
                  >
                    Открыть Pro
                  </Link>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                План на 7 дней
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Короткие шаги на каждый день
              </h2>

              <div className="mt-5 grid gap-2">
                {sevenDayPlan.map((item, index) => (
                  <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-sm leading-6 text-slate-700">
                      <span className="font-black text-slate-950">{index + 1}. </span>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Текущий предмет в тренажёре</p>
              <p className="mt-1 text-xl font-black">{subjectLabel}</p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/profile"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  Настроить профиль
                </Link>

                <Link
                  href="/home"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  Открыть тренажёр
                </Link>
              </div>

              <p className="mt-5 break-all text-xs leading-5 text-slate-400">
                ID оплаты: {getPaymentUserId()}
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
