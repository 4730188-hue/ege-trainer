"use client";

import Link from "next/link";
import { useEffect } from "react";
import { trackClientEvent } from "@/lib/clientAnalytics";

export default function EgeDiagnosticLandingPage() {
  useEffect(() => {
    trackClientEvent("diagnostic_landing_view", {
      source: "site_diagnostic_landing",
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
            EGE Trainer
          </p>

          <div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
                ЕГЭ уже скоро.
                <br />
                Проверь, где теряешь баллы
              </h1>

              <p className="mt-6 text-xl leading-relaxed text-slate-300">
                Пройди бесплатную диагностику за 5 минут и узнай, какие темы
                проседают по русскому, математике или обществознанию.
              </p>

              <div className="mt-7 grid gap-3 text-base text-slate-200">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  🎯 найдём слабые места
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  🧠 покажем, что повторять в первую очередь
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  🚀 дадим задания для тренировки
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-200">
                  Для ученика и родителя
                </p>
                <p className="mt-2 text-base leading-relaxed text-slate-200">
                  Диагностика покажет, какие темы проседают, а план на 7 дней поможет заниматься без хаоса.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  После результата можно сохранить прогресс в Telegram и открыть короткий план подготовки за 199 ₽.
                </p>
              </div>

              <Link
                href="/diagnosis?source=yandex_site_diagnostic"
                onClick={() =>
                  trackClientEvent("diagnostic_landing_start_click", {
                    source: "yandex_site_diagnostic",
                  })
                }
                className="mt-8 block rounded-2xl bg-blue-600 px-6 py-5 text-center text-lg font-black text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Пройти диагностику бесплатно
              </Link>

              <p className="mt-4 text-center text-sm text-slate-400">
                Без регистрации · прямо в браузере · около 5 минут
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-5 text-slate-950 shadow-2xl">
              <div className="rounded-3xl bg-slate-100 p-5">
                <p className="text-sm font-bold text-blue-600">
                  Твой быстрый разбор
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>Русский язык</span>
                      <span>62%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-300">
                      <div className="h-3 w-[62%] rounded-full bg-blue-600" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>Математика</span>
                      <span>48%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-300">
                      <div className="h-3 w-[48%] rounded-full bg-yellow-500" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>Обществознание</span>
                      <span>55%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-300">
                      <div className="h-3 w-[55%] rounded-full bg-red-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 p-5">
                <p className="font-black">После диагностики ты узнаешь:</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>✅ где теряешь баллы;</li>
                  <li>✅ какие темы повторить;</li>
                  <li>✅ какие задания тренировать дальше.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
