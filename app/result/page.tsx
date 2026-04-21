import Link from "next/link";

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Результат диагностики</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Готово
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Твоя стартовая картина готова
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Ты уже справляешься с частью заданий, но пока теряешь баллы на нескольких
            повторяющихся темах.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Текущий уровень
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">Нестабильный</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Сейчас у тебя уже есть база, но результат пока сильно зависит от темы задания.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Слабые темы
          </p>

          <div className="space-y-3">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Орфография
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Пунктуация
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-900">
              Лексика
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Что делать дальше
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Если заниматься по 15 минут в день, сначала стоит закрыть эти 3 темы.
            После этого результат станет заметно стабильнее.
          </p>
        </div>

        <div className="mt-auto pb-4">
          <Link
            href="/paywall"
            className="block w-full rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white shadow-sm shadow-slate-300/40 transition hover:opacity-95"
          >
            Начать первую сессию
          </Link>

          <p className="mt-3 text-center text-sm text-slate-500">
            Первая сессия займёт около 7 минут
          </p>
        </div>
      </div>
    </main>
  );
}
