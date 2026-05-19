"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveWebAccountUserId } from "@/lib/storage";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось зарегистрироваться");
      }

      saveWebAccountUserId(data.user.id);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-black leading-none text-white">
              ЕГЭ
            </span>
            <span className="text-lg font-black">Plan</span>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white"
          >
            Войти
          </Link>
        </header>

        <section className="grid flex-1 gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-200">
              Личный кабинет
            </p>

            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Сохраните результат и продолжайте подготовку
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
              Кабинет нужен, чтобы результат диагностики, прогресс, тренировки и Pro-доступ были привязаны к вашему email.
            </p>

            <div className="mt-8 grid gap-3 text-base text-slate-200">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                ✅ результат диагностики не потеряется
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                ✅ доступ после оплаты сохранится за аккаунтом
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                ✅ можно заниматься с телефона или компьютера
              </div>
            </div>
          </div>

          <section className="rounded-[2.2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              Создание кабинета
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Зарегистрируйтесь за минуту
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Укажите email и пароль. После этого откроется личный кабинет подготовки.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-950 outline-none focus:border-blue-500"
              />

              <input
                type="password"
                placeholder="Пароль минимум 6 символов"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-950 outline-none focus:border-blue-500"
              />

              {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-center text-lg font-black text-white shadow-xl shadow-blue-600/20 disabled:opacity-60"
              >
                {loading ? "Создаём кабинет..." : "Создать кабинет"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Уже есть кабинет?{" "}
              <Link href="/login" className="font-black text-blue-600">
                Войти
              </Link>
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
