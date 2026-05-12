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
    <main className="min-h-screen bg-[#050816] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-300">
            EGE Trainer
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight">
            Вход в кабинет
          </h1>
          <p className="mt-3 text-slate-300">
            Войдите, чтобы открыть результат, прогресс и Pro-доступ.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-slate-950 outline-none"
            />

            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-slate-950 outline-none"
            />

            {error ? (
              <p className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white disabled:opacity-60"
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-300">
            Нет кабинета?{" "}
            <Link href="/register" className="font-bold text-blue-300">
              Зарегистрироваться
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
