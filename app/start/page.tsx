'use client';

import { useEffect, useMemo } from 'react';

export default function StartPage() {
  const telegramLink = useMemo(() => {
    // TODO: Replace this with the real Mini App launch link if needed.
    // Examples:
    // return 'https://t.me/YOUR_BOT/YOUR_APP';
    // return 'https://t.me/YOUR_BOT?start=diagnostic';
    return 'https://t.me/EGETrainerSupportBot';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const utmData = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      content: params.get('utm_content'),
      term: params.get('utm_term'),
      subject: params.get('subject'),
      visitedAt: new Date().toISOString(),
    };

    localStorage.setItem('ege_trainer_utm', JSON.stringify(utmData));
  }, []);

  const handleTelegramClick = () => {
    if (typeof window !== 'undefined') {
      const win = window as typeof window & {
        ym?: (...args: unknown[]) => void;
        YM_COUNTER_ID?: number;
      };

      if (win.ym && win.YM_COUNTER_ID) {
        win.ym(win.YM_COUNTER_ID, 'reachGoal', 'click_telegram_start');
      }
    }

    window.location.href = telegramLink;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-12 text-center">
        <div className="mb-5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
          ЕГЭ в Telegram · русский · математика · обществознание
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
          Бесплатная диагностика ЕГЭ прямо в Telegram
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
          Узнай слабые места, решай задания и получай понятные разборы ошибок.
          EGE Trainer помогает готовиться к ЕГЭ без хаоса — каждый день по 10–15 минут.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleTelegramClick}
            className="rounded-2xl bg-cyan-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300"
          >
            Пройти бесплатную диагностику
          </button>

          <a
            href="#how-it-works"
            className="rounded-2xl border border-white/15 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Как это работает
          </a>
        </div>

        <div className="mt-10 grid w-full gap-4 text-left md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-2xl">🎯</div>
            <h3 className="mt-3 text-lg font-bold">Диагностика уровня</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Пройди короткий тест и пойми, какие темы проседают прямо сейчас.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-2xl">🧠</div>
            <h3 className="mt-3 text-lg font-bold">Разбор ошибок</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Не просто “правильно/неправильно”, а объяснение правила и типичной ловушки.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-2xl">📈</div>
            <h3 className="mt-3 text-lg font-bold">Прогресс без хаоса</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Тренируйся регулярно, закрывай слабые места и отслеживай результат.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-5 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
          <h2 className="text-3xl font-bold">Как работает EGE Trainer</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                1
              </div>
              <h3 className="font-bold">Открываешь Telegram</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Без сложных платформ, логинов и лишних кабинетов.
              </p>
            </div>

            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                2
              </div>
              <h3 className="font-bold">Выбираешь предмет</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Русский язык, математика или обществознание.
              </p>
            </div>

            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                3
              </div>
              <h3 className="font-bold">Решаешь задания</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Диагностика, тренировки и мини-варианты.
              </p>
            </div>

            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                4
              </div>
              <h3 className="font-bold">Разбираешь ошибки</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Понимаешь правило, ловушку и ход решения.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-slate-900 p-6">
            <h3 className="text-xl font-bold">Для кого это</h3>
            <p className="mt-3 leading-7 text-slate-300">
              Для школьников 10–11 классов, которые хотят готовиться к ЕГЭ регулярно,
              но без хаоса. И для родителей, которым нужен понятный инструмент подготовки:
              ребёнок занимается прямо в Telegram и видит свой прогресс.
            </p>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleTelegramClick}
              className="rounded-2xl bg-cyan-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300"
            >
              Начать подготовку в Telegram
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
