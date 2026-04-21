import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Твоя подготовка к ЕГЭ
          </h1>
          <p className="mt-4 text-base text-slate-600">Цель: 80 баллов</p>
          <p className="mt-2 text-base text-slate-600">Сессия на сегодня</p>

          <Link
            href="/diagnosis"
            className="mt-6 inline-block rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:opacity-95"
          >
            Начать сессию
          </Link>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Link
              href="/home"
              className="rounded-2xl bg-slate-900 px-3 py-3 font-semibold text-white"
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
