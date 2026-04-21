import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Внутренний кабинет</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
            Твоя подготовка к ЕГЭ
          </h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Цель</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">80 баллов</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Держим темп и усиливаем слабые темы без перегруза.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <p className="text-sm font-medium text-slate-300">Сессия на сегодня</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight">
            5 заданий по слабым темам и 1 на повторение
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Короткая тренировка, чтобы закрепить прогресс и не потерять ритм.
          </p>
          <Link
            href="/session"
            className="mt-5 block rounded-2xl bg-white px-5 py-4 text-center text-base font-semibold text-slate-900 transition hover:opacity-95"
          >
            Начать сессию
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Решено</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">48</p>
            <p className="mt-1 text-sm text-slate-500">за эту неделю</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-500">Точность</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">71%</p>
            <p className="mt-1 text-sm text-slate-500">средний результат</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Сегодня в фокусе</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Пунктуация</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Повторим сложные случаи с запятыми в сложных предложениях.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Прогноз</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">78–82 балла</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Если продолжишь заниматься в таком темпе, цель выглядит реалистично.
          </p>
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
