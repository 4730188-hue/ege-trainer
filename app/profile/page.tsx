import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Аккаунт</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Профиль
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Профиль</h1>
          <div className="mt-5 space-y-3 rounded-3xl bg-slate-50 p-4 text-base text-slate-700">
            <p>Предмет: Русский язык</p>
            <p>Цель: 80 баллов</p>
            <p>Тариф: Pro</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="block rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold shadow-sm shadow-slate-300/40 transition hover:opacity-95"
          >
            <span className="block leading-none text-white">Настроить уведомления</span>
          </Link>
          <Link
            href="/profile"
            className="block rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold shadow-sm shadow-slate-300/40 transition hover:opacity-95"
          >
            <span className="block leading-none text-white">Управление подпиской</span>
          </Link>
          <Link
            href="/profile"
            className="block rounded-3xl bg-slate-900 px-5 py-4 text-center text-base font-semibold shadow-sm shadow-slate-300/40 transition hover:opacity-95"
          >
            <span className="block leading-none text-white">Написать в поддержку</span>
          </Link>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 pb-6">
          <div className="grid grid-cols-3 gap-2 text-sm items-center">
            <Link
              href="/home"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Главная</span>
            </Link>
            <Link
              href="/progress"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link
              href="/profile"
              className="rounded-2xl bg-slate-900 px-3 py-3 font-semibold text-white text-center whitespace-nowrap"
            >
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
