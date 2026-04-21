import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">Профиль</h1>
          <p className="mt-4 text-base text-slate-600">Предмет: Русский язык</p>
          <p className="mt-2 text-base text-slate-600">Цель: 80 баллов</p>
          <p className="mt-2 text-base text-slate-600">Тариф: Pro</p>

          <div className="mt-6 space-y-3">
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
        </div>

        <div className="mt-auto flex items-center justify-between pb-4 text-sm font-medium text-slate-500">
          <Link href="/home">Главная</Link>
          <Link href="/progress">Прогресс</Link>
          <Link href="/profile">Профиль</Link>
        </div>
      </div>
    </main>
  );
}
