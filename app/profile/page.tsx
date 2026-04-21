import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Аккаунт</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">Профиль</h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="space-y-3 text-base text-slate-700">
            <p>Предмет: Русский язык</p>
            <p>Цель: 80 баллов</p>
            <p>Тариф: Pro</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="block rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white transition hover:opacity-95"
          >
            Настроить уведомления
          </Link>
          <Link
            href="/profile"
            className="block rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white transition hover:opacity-95"
          >
            Управление подпиской
          </Link>
          <Link
            href="/profile"
            className="block rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white transition hover:opacity-95"
          >
            Написать в поддержку
          </Link>
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
              className="rounded-2xl bg-slate-900 px-3 py-3 font-semibold text-white"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
