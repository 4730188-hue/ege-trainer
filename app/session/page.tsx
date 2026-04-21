import Link from "next/link";

export default function SessionPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Сессия на сегодня
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            5 заданий по слабым темам и 1 задание на повторение.
          </p>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Пунктуация</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
              Где нужна запятая?
            </h2>

            <div className="mt-6 space-y-3">
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-medium text-slate-900">
                Вариант 1
              </button>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-medium text-slate-900">
                Вариант 2
              </button>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-medium text-slate-900">
                Вариант 3
              </button>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-medium text-slate-900">
                Вариант 4
              </button>
            </div>

            <button className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:opacity-95">
              Проверить ответ
            </button>
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
              className="rounded-2xl px-3 py-3 font-medium text-slate-500"
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
