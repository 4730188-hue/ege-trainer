import Link from "next/link";

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Твой прогресс
          </h1>
          <p className="mt-4 text-base text-slate-600">Решено: 48 заданий</p>
          <p className="mt-2 text-base text-slate-600">Верно: 71%</p>
          <p className="mt-2 text-base text-slate-600">Активных дней: 6</p>

          <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-base text-slate-700">
            <p>Сильная тема: Орфография</p>
            <p>Нужно закрепить: Пунктуация</p>
            <p>Слабая тема: Лексика</p>
          </div>
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
