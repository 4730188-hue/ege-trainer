"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAppState,
  getExamTimelineLabel,
  getFreeGateStatus,
  getProPlanLabel,
  getProSubscription,
  getStudentProfile,
  getSubjectLabel,
  updateStudentSubject,
  type FreeGateStatus,
  type ProSubscription,
  type StudentProfile,
} from "@/lib/storage";

const subjectOptions = [
  { key: "russian", label: "Русский язык" },
  { key: "math", label: "Профильная математика" },
  { key: "social", label: "Обществознание" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [proSubscription, setProSubscription] = useState<ProSubscription | null>(null);
  const [sessionGate, setSessionGate] = useState<FreeGateStatus | null>(null);
  const [miniVariantGate, setMiniVariantGate] = useState<FreeGateStatus | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfile(getStudentProfile());
    setProSubscription(getProSubscription());
    setSessionGate(getFreeGateStatus("session"));
    setMiniVariantGate(getFreeGateStatus("miniVariant"));
  }, []);

  const subjectLabel = getSubjectLabel(profile?.subject) ?? "Русский язык";
  const targetLabel = profile?.targetScore ? `${profile.targetScore} баллов` : "80 баллов";
  const dailyLabel = profile?.dailyMinutes ? `${profile.dailyMinutes} минут` : null;
  const timelineLabel = getExamTimelineLabel(profile?.examTimeline);
  const isPro = Boolean(proSubscription?.isPro);
  const blockedFeature = sessionGate?.isBlocked ? "session" : miniVariantGate?.isBlocked ? "miniVariant" : null;

  const handleSubjectChange = (subject: "russian" | "math" | "social") => {
    const nextProfile = updateStudentSubject(subject);
    setProfile(nextProfile);
  };

  const handleReset = () => {
    clearAppState();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Аккаунт</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight">Профиль</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Здесь видно, что уже открыто по тарифу и как сейчас устроен тренировочный процесс.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPro ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
              {isPro ? getProPlanLabel(proSubscription?.activePlan) : "Free план"}
            </span>
          </div>

          <div className="mt-5 space-y-3 rounded-3xl bg-slate-50 p-4 text-base text-slate-700">
            <p>Предмет: {subjectLabel}</p>
            <p>Цель: {targetLabel}</p>
            {dailyLabel && <p>В день: {dailyLabel}</p>}
            {timelineLabel && <p>Экзамен: {timelineLabel}</p>}
            <p>Тариф: {isPro ? getProPlanLabel(proSubscription?.activePlan) : "Free"}</p>
            <p>Режим: тренировочный профиль</p>
          </div>
        </div>

        {isPro ? (
          <div className="rounded-3xl border border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(220,252,231,0.9))] p-5 shadow-[0_18px_40px_rgba(16,185,129,0.08)]">
            <p className="text-sm font-medium text-slate-500">Подписка активна</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{getProPlanLabel(proSubscription?.activePlan)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Полный доступ уже открыт локально. Дата активации: {proSubscription?.activatedAt ? new Date(proSubscription.activatedAt).toLocaleDateString("ru-RU") : "сейчас"}.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-white/70 p-4">• Безлимитные session</div>
              <div className="rounded-2xl bg-white/70 p-4">• Безлимитные mini-variant</div>
              <div className="rounded-2xl bg-white/70 p-4">• Умный повтор ошибок</div>
              <div className="rounded-2xl bg-white/70 p-4">• Roadmap и расширенный progress</div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Статус подписки</p>
                <p className="mt-1 text-xl font-bold text-slate-900">Сейчас активен Free</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {blockedFeature ? "Есть причина открыть Pro" : "Можно усилить"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {blockedFeature
                ? `Сегодня уже достигнут лимит на ${blockedFeature === "session" ? "сессию" : "мини-вариант"}. Pro нужен не для давления, а чтобы продолжить подготовку без паузы в самый полезный момент.`
                : "Free помогает собрать стартовый срез и войти в тренировочный ритм. Pro снимает лимиты и делает процесс спокойным и устойчивым."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Сейчас открыто</p>
                <div className="mt-2 space-y-2 text-slate-600">
                  <p>• 1 session в день</p>
                  <p>• 1 mini-variant запуск в день</p>
                  <p>• Базовый прогресс и тренировочный профиль</p>
                </div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="font-semibold text-slate-900">Доступно в Pro</p>
                <div className="mt-2 space-y-2 text-slate-700">
                  <p>• Безлимитная практика</p>
                  <p>• Умный повтор ошибок</p>
                  <p>• Roadmap и расширенный progress</p>
                </div>
              </div>
            </div>
            <Link href="/paywall" className="primary-cta mt-5">
              <span className="block leading-none text-white">Посмотреть Pro</span>
            </Link>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Текущий предмет</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Основной переключатель на главной
            </span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900">{subjectLabel}</p>
          <div className="mt-4 space-y-2">
            {subjectOptions.map((option) => {
              const isActive = profile?.subject === option.key || (!profile?.subject && option.key === "russian");

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSubjectChange(option.key)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Здесь предмет тоже можно поменять, но основной быстрый сценарий находится на главной. Остальной прогресс, подписка и история остаются на месте.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-medium text-slate-500">Дневной доступ</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Session</p>
              <p className="mt-2 text-slate-600">{isPro ? "Без ограничений" : `${sessionGate?.count ?? 0}/${sessionGate?.limit ?? 1} сегодня`}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Mini-variant</p>
              <p className="mt-2 text-slate-600">{isPro ? "Без ограничений" : `${miniVariantGate?.count ?? 0}/${miniVariantGate?.limit ?? 1} сегодня`}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/paywall" className="primary-cta">
            <span className="block leading-none text-white">{isPro ? "Управление Pro" : "Открыть Pro"}</span>
          </Link>
          <Link href="/profile" className="primary-cta">
            <span className="block leading-none text-white">Настроить уведомления</span>
          </Link>
          <Link href="/profile" className="primary-cta">
            <span className="block leading-none text-white">Написать в поддержку</span>
          </Link>
          <button type="button" onClick={handleReset} className="secondary-cta">
            Начать заново
          </button>
        </div>

        <div className="bottom-nav">
          <div className="bottom-nav-grid">
            <Link href="/home" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Главная</span>
            </Link>
            <Link href="/progress" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link href="/profile" className="bottom-nav-link bottom-nav-link-active whitespace-nowrap">
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
