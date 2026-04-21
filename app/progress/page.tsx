import Link from "next/link";

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Аналитика</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
            Твой прогресс
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Решено</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">48</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Верно</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">71%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Активных дней</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">6</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Темы</p>
          <div className="mt-4 space-y-3 text-base text-slate-700">
            <p>Сильная тема: Орфография</p>
            <p>Нужно закрепить: Пунктуация</p>
            <p>Слабая тема: Лексика</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-base leading-7 text-slate-600">
            Ты стабильно двигаешься вверх. Сейчас главное, не бросать короткие
            ежедневные тренировки и добить пунктуацию.
          </p>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Link
              href="/home"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500"
            >
              Главная
            </Link>
            <Link
              href="/progress"
              className="rounded-2xl bg-slate-900 px-3 py-3 font-semibold text-white"
            >
              Прогресс
            </Link>
            <Link
              href="/profile"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
