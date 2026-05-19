"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveWebAccountUserId } from "@/lib/storage";

export default function LoginPage() {
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

      const response = await fetch("/api/auth/login", {
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
        throw new Error(data.error || "Не удалось войти");
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
            href="/register"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white"
          >
            Создать кабинет
          </Link>
        </header>

        <section className="grid flex-1 gap-10 py-12 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-200">
              Вход в кабинет
            </p>

            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Вернитесь к подготовке
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
              После входа откроются сохранённый прогресс, статус Pro-доступа и кнопки для продолжения тренировки.
            </p>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm font-bold text-blue-200">
                Важно
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Если вы уже оплатили доступ с этого аккаунта, Pro подтянется автоматически после входа.
              </p>
            </div>
          </div>

          <section className="rounded-[2.2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
              EGE Plan
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Войти по email
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Введите email и пароль, которые указали при создании кабинета.
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
                placeholder="Пароль"
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
                {loading ? "Входим..." : "Войти в кабинет"}
              </button>
            </form>

            <div className="mt-5 grid gap-3 text-center text-sm">
              <Link href="/register" className="font-black text-blue-600">
                Создать новый кабинет
              </Link>

              <p className="text-slate-500">
                Забыли пароль? Пока напишите в поддержку — восстановление через email добавим следующим шагом.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
