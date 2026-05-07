"use client";

import { FormEvent, useState } from "react";

type EventRow = {
  event_name: string;
  count: number;
};

type RecentEvent = {
  event_name: string;
  user_id?: string;
  telegram_id?: string;
  telegram_username?: string;
  telegram_first_name?: string;
  telegram_last_name?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

type StatsData = {
  eventTotals: EventRow[];
  todayTotals: EventRow[];
  payments: {
    total_payments: number;
    succeeded_payments: number;
    revenue: string;
  };
  activeSubscriptions: number;
  recentEvents: RecentEvent[];
};

function getCount(rows: EventRow[], eventName: string) {
  return rows.find((row) => row.event_name === eventName)?.count || 0;
}

export default function AdminStatsPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStats(event?: FormEvent) {
    event?.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin-stats?password=${encodeURIComponent(password)}`,
        { cache: "no-store" }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Не удалось загрузить статистику");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
            EGE Trainer
          </p>
          <h1 className="mt-2 text-4xl font-black">Статистика</h1>
          <p className="mt-3 text-slate-300">
            Бот, оплаты, Pro и последние события.
          </p>
        </div>

        <form onSubmit={loadStats} className="mb-8 flex gap-3">
          <input
            type="password"
            placeholder="Пароль статистики"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? "Загрузка..." : "Показать"}
          </button>
        </form>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">/start всего</p>
                <p className="mt-2 text-4xl font-black">
                  {getCount(data.eventTotals, "main_bot_start")}
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">/start сегодня</p>
                <p className="mt-2 text-4xl font-black">
                  {getCount(data.todayTotals, "main_bot_start")}
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Успешные оплаты</p>
                <p className="mt-2 text-4xl font-black">
                  {data.payments.succeeded_payments}
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Активные Pro</p>
                <p className="mt-2 text-4xl font-black">
                  {data.activeSubscriptions}
                </p>
              </div>
            </section>

            <section className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Создано платежей</p>
                <p className="mt-2 text-4xl font-black">
                  {data.payments.total_payments}
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Выручка</p>
                <p className="mt-2 text-4xl font-black">
                  {Number(data.payments.revenue).toLocaleString("ru-RU")} ₽
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Обращения в поддержку</p>
                <p className="mt-2 text-4xl font-black">
                  {getCount(data.eventTotals, "support_message")}
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">Оплаты сегодня</p>
                <p className="mt-2 text-4xl font-black">
                  {getCount(data.todayTotals, "payment_succeeded")}
                </p>
              </div>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-5">
                <h2 className="mb-4 text-2xl font-black">Все события</h2>
                <div className="space-y-2">
                  {data.eventTotals.map((row) => (
                    <div
                      key={row.event_name}
                      className="flex justify-between rounded-2xl bg-white/5 px-4 py-3"
                    >
                      <span>{row.event_name}</span>
                      <b>{row.count}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-5">
                <h2 className="mb-4 text-2xl font-black">Сегодня</h2>
                <div className="space-y-2">
                  {data.todayTotals.map((row) => (
                    <div
                      key={row.event_name}
                      className="flex justify-between rounded-2xl bg-white/5 px-4 py-3"
                    >
                      <span>{row.event_name}</span>
                      <b>{row.count}</b>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white/10 p-5">
              <h2 className="mb-4 text-2xl font-black">Последние события</h2>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-slate-300">
                    <tr>
                      <th className="py-3">Дата</th>
                      <th className="py-3">Событие</th>
                      <th className="py-3">User ID</th>
                      <th className="py-3">Telegram</th>
                      <th className="py-3">Имя</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.map((event, index) => (
                      <tr
                        key={`${event.created_at}-${index}`}
                        className="border-t border-white/10"
                      >
                        <td className="py-3">
                          {new Date(event.created_at).toLocaleString("ru-RU")}
                        </td>
                        <td className="py-3 font-bold">{event.event_name}</td>
                        <td className="py-3">{event.user_id || "—"}</td>
                        <td className="py-3">
                          {event.telegram_username
                            ? `@${event.telegram_username}`
                            : event.telegram_id || "—"}
                        </td>
                        <td className="py-3">
                          {[event.telegram_first_name, event.telegram_last_name]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
