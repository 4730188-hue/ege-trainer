"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const benefits = [
  "Быстрый старт с понятной диагностикой",
  "Короткие сессии без перегруза",
  "Маршрут к целевому баллу по слабым темам",
];

function FirstImpressionScreen() {
  return (
    <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col justify-between gap-5">
        <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>EGE Trainer</span>
          <span className="rounded-full bg-indigo-100/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            Telegram Mini App
          </span>
        </div>

        <section className="relative overflow-hidden rounded-[2.2rem] border border-indigo-100/80 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.34),transparent_34%),linear-gradient(135deg,#1e1b4b_0%,#312e81_42%,#4338ca_100%)] px-6 py-8 text-white shadow-[0_30px_80px_rgba(49,46,129,0.32)]">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_70%)]" />
          <div className="relative z-10">
            <h1 className="text-[2.75rem] font-black leading-[1.02] tracking-tight">
              Супер-тренажёр для ЕГЭ
            </h1>
            <p className="mt-4 text-base leading-7 text-indigo-100/88">
              Помогает дойти до нужного балла. Быстро, удобно и просто.
            </p>

            <Link
              href="/?screen=start"
              className="relative z-10 mt-8 block rounded-[1.9rem] bg-[linear-gradient(135deg,#312e81_0%,#4338ca_52%,#7c3aed_100%)] px-6 py-5 text-center text-lg font-semibold text-white shadow-[0_22px_50px_rgba(79,70,229,0.32)] transition hover:translate-y-[-1px]"
            >
              <span className="block leading-none text-white">Начать</span>
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-white/70 bg-white/65 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-lg font-bold text-slate-950">7 мин</p>
            <p className="mt-1 text-[11px] text-slate-500">на сессию</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/65 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-lg font-bold text-slate-950">1 план</p>
            <p className="mt-1 text-[11px] text-slate-500">под тебя</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/65 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="text-lg font-bold text-slate-950">Mini App</p>
            <p className="mt-1 text-[11px] text-slate-500">без хаоса</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function PreviousStartScreen() {
  return (
    <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>EGE Trainer</span>
          <span className="rounded-full bg-indigo-100/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            Premium Mini App
          </span>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100/80 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.34),transparent_34%),linear-gradient(135deg,#1e1b4b_0%,#312e81_42%,#4338ca_100%)] p-6 text-white shadow-[0_30px_80px_rgba(49,46,129,0.32)]">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_70%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-indigo-100 uppercase">
              Подготовка к ЕГЭ нового уровня
            </div>

            <h1 className="mt-5 text-[2.6rem] font-black leading-[1.02] tracking-tight">
              Выходи на свой балл с ощущением ясного плана, а не хаоса.
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-7 text-indigo-100/88">
              Диагностика, умные короткие сессии и персональный маршрут в одном красивом Telegram Mini App.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-3 backdrop-blur">
                <p className="text-lg font-bold">7 мин</p>
                <p className="mt-1 text-[11px] text-indigo-100/78">на сессию</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-3 backdrop-blur">
                <p className="text-lg font-bold">3 шага</p>
                <p className="mt-1 text-[11px] text-indigo-100/78">до старта</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-3 backdrop-blur">
                <p className="text-lg font-bold">1 план</p>
                <p className="mt-1 text-[11px] text-indigo-100/78">под тебя</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/onboarding"
                className="block rounded-[1.65rem] bg-white px-5 py-4 text-center text-base font-semibold text-slate-950 shadow-[0_18px_40px_rgba(255,255,255,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_42px_rgba(255,255,255,0.26)]"
              >
                Начать красиво и быстро
              </Link>
              <Link
                href="/home"
                className="block rounded-[1.65rem] border border-white/15 bg-white/10 px-5 py-4 text-center text-base font-semibold text-white/92 backdrop-blur transition hover:bg-white/14"
              >
                Уже внутри? Открыть кабинет
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[1.9rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Почему это цепляет</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Видишь ценность за 3 секунды</h2>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Focused UX
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700">{benefit}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LandingPage() {
  const [isStartScreen, setIsStartScreen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    setIsStartScreen(params.get("screen") === "start");
  }, []);

  return isStartScreen ? <PreviousStartScreen /> : <FirstImpressionScreen />;
}
