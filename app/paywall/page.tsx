"use client";

import { trackClientEvent } from "@/lib/clientAnalytics";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopMenu from "@/app/components/TopMenu";
import {
  getFreeGateStatus,
  getPaymentUserId,
  getProPlanLabel,
  getProSubscription,
  getRepeatInsight,
  getStudentProfile,
  getSubjectLabel,
  getTelegramUserProfile,
  normalizeSubjectKey,
  syncProSubscriptionFromServer,
  type ProPlanKey,
  type ProSubscription,
} from "@/lib/storage";

const plans: Array<{
  key: ProPlanKey;
  title: string;
  price: string;
  oldPrice?: string;
  note: string;
  badge?: string;
  description: string;
}> = [
  {
    key: "weekly",
    title: "7 дней",
    price: "199 ₽",
    note: "попробовать",
    badge: "лучший старт",
    description: "Открыть недельный план, тренировки и повтор ошибок.",
  },
  {
    key: "monthly",
    title: "1 месяц",
    price: "690 ₽",
    note: "заниматься регулярно",
    badge: "частый выбор",
    description: "Подходит, если нужно спокойно заниматься несколько недель.",
  },
  {
    key: "quarterly",
    title: "3 месяца",
    price: "1490 ₽",
    note: "на длинную подготовку",
    description: "Для тех, кто хочет готовиться до экзамена без перерывов.",
  },
];

type TelegramPaymentWindow = Window & {
  Telegram?: {
    WebApp?: {
      openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
    };
  };
};

function openPaymentLink(url: string) {
  const telegramWebApp = (window as TelegramPaymentWindow).Telegram?.WebApp;

  if (telegramWebApp?.openLink) {
    telegramWebApp.openLink(url, { try_instant_view: false });
    return;
  }

  window.location.href = url;
}

function getInitialPlan(): ProPlanKey {
  if (typeof window === "undefined") return "weekly";

  const plan = new URLSearchParams(window.location.search).get("plan");

  if (plan === "weekly" || plan === "monthly" || plan === "quarterly") {
    return plan;
  }

  return "weekly";
}

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<ProPlanKey>("weekly");
  const [subscription, setSubscription] = useState<ProSubscription | null>(null);
  const [subjectLabel, setSubjectLabel] = useState("предмет");
  const [repeatCount, setRepeatCount] = useState(0);
  const [sessionGate, setSessionGate] = useState<ReturnType<typeof getFreeGateStatus> | null>(null);
  const [miniGate, setMiniGate] = useState<ReturnType<typeof getFreeGateStatus> | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    trackClientEvent("paywall_view");

    setSelectedPlan(getInitialPlan());

    const profile = getStudentProfile();
    const subject = normalizeSubjectKey(profile?.subject);

    setSubjectLabel(getSubjectLabel(subject));
    setRepeatCount(getRepeatInsight(subject).repeatCount);
    setSessionGate(getFreeGateStatus("session"));
    setMiniGate(getFreeGateStatus("miniVariant"));
    setSubscription(getProSubscription());

    const checkServerSubscription = () => {
      syncProSubscriptionFromServer()
        .then(setSubscription)
        .catch(() => {
          // Если сервер недоступен, оставляем локальный статус.
        });
    };

    checkServerSubscription();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkServerSubscription();
      }
    };

    window.addEventListener("focus", checkServerSubscription);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", checkServerSubscription);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const isPro = Boolean(subscription?.isPro);
  const selectedPlanData = useMemo(
    () => plans.find((plan) => plan.key === selectedPlan) ?? plans[0],
    [selectedPlan]
  );

  const handleActivate = async () => {
    try {
      setIsPaying(true);
      setPaymentError("");

      trackClientEvent("paywall_payment_click", {
        plan: selectedPlan,
        source: "web_paywall",
      });

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: getPaymentUserId(),
          telegramUser: getTelegramUserProfile(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Не удалось создать оплату");
      }

      if (!data.confirmationUrl) {
        throw new Error("ЮKassa не вернула ссылку на оплату");
      }

      openPaymentLink(data.confirmationUrl);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Не удалось перейти к оплате");
    } finally {
      setIsPaying(false);
    }
  };

  if (isPro) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
        <TopMenu subtitle="подписка активна" />
        <div className="mx-auto w-full max-w-md pt-7">
          <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-7">
            <p className="text-sm font-semibold text-emerald-700">Pro активирован</p>
            <h1 className="mt-2 text-[2.1rem] font-black leading-tight tracking-[-0.055em]">
              Полный режим подготовки уже включён
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Безлимитные тренировки, мини-варианты, повторы и расширенный прогресс доступны.
            </p>
            <Link
              href="/account"
              className="mt-7 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-semibold text-white"
            >
              Вернуться в кабинет
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="px-5 py-6">
        <div className="mx-auto max-w-6xl">
          <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
            <Link href="/" className="flex items-center gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-black leading-none text-white">
                ЕГЭ
              </span>
              <span className="text-lg font-black">Plan</span>
            </Link>

            <Link
              href="/account"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white"
            >
              Кабинет
            </Link>
          </header>

          <div className="grid gap-10 py-12 md:grid-cols-[0.95fr_1.05fr] md:items-start md:py-16">
            <div>
              <p className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-200">
                Полный режим подготовки
              </p>

              <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Откройте план подготовки
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
                После бесплатного старта можно продолжить: тренировки по слабым темам, мини-варианты, повтор ошибок и прогресс в кабинете.
              </p>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
                <p className="text-sm font-bold text-blue-200">Что входит</p>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-200">
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    ✅ тренировки по русскому, математике и обществознанию
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    ✅ повтор ошибок, чтобы темы закреплялись
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    ✅ мини-варианты и проверка прогресса
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3">
                    ✅ доступ с сайта и через Telegram
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                Без автосписаний. Оплата разовая. Доступ сохраняется за аккаунтом или Telegram-профилем.
              </p>
            </div>

            <section className="rounded-[2.2rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
              <div className="rounded-[1.8rem] bg-slate-50 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                  Выберите доступ
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {selectedPlanData.title} — {selectedPlanData.price}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {selectedPlanData.description}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {plans.map((plan) => {
                  const active = selectedPlan === plan.key;

                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setSelectedPlan(plan.key)}
                      className={`relative rounded-[1.5rem] border p-5 text-left transition ${
                        active
                          ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {plan.badge ? (
                        <span className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                          {plan.badge}
                        </span>
                      ) : null}

                      <div className="text-lg font-black">{plan.title}</div>
                      <div className="mt-3 text-3xl font-black">{plan.price}</div>
                      <div className="mt-1 text-sm font-bold text-slate-500">{plan.note}</div>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
                        {plan.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-black text-emerald-700">
                  Дешевле одного занятия с репетитором
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Внутри — сразу 3 предмета, тренировки, повтор ошибок и прогресс.
                </p>
              </div>

              <button
                type="button"
                onClick={handleActivate}
                disabled={isPaying}
                className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 text-center text-lg font-black text-white shadow-xl shadow-blue-600/20 disabled:opacity-60"
              >
                {isPaying ? "Открываем оплату..." : `Оплатить ${selectedPlanData.price}`}
              </button>

              {paymentError ? (
                <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600">
                  {paymentError}
                </p>
              ) : null}

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Оплата проходит через ЮKassa. После оплаты доступ включится автоматически.
              </p>
            </section>
          </div>

          <section className="grid gap-4 pb-12 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-slate-400">Предмет в профиле</p>
              <p className="mt-2 text-xl font-black">{subjectLabel}</p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-slate-400">Ошибок на повторе</p>
              <p className="mt-2 text-xl font-black">{repeatCount}</p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-slate-400">Free-лимит</p>
              <p className="mt-2 text-xl font-black">
                {sessionGate?.count ?? 0} тренировок · {miniGate?.count ?? 0} мини-вариантов
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
