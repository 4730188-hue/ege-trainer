import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4">
        <div className="flex items-center justify-center rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Telegram Mini App demo
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">EGE Trainer</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
            Подготовка к ЕГЭ без хаоса
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Мини-приложение ведёт от первых настроек к диагностике, результатам и
            ежедневным сессиям.
          </p>

          <div className="mt-6 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Что внутри</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Быстрый старт, диагностика и ежедневные короткие сессии в одном
              аккуратном мобильном интерфейсе.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/onboarding"
              className="block rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold shadow-sm shadow-slate-300/40 transition hover:opacity-95"
            >
              <span className="block leading-none text-white">Начать</span>
            </Link>
            <Link
              href="/home"
              className="block rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Открыть кабинет
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
