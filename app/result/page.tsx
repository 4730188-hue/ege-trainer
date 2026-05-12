"use client";

import { trackClientEvent } from "@/lib/clientAnalytics";
import { useEffect, useMemo, useState } from "react";
import { getDiagnosisResult, getSubjectLabel, type DiagnosisResult } from "@/lib/storage";
import TopMenu from "@/app/components/TopMenu";

function getSubjectAdvice(subjectLabel: string) {
  if (subjectLabel === "Профильная математика") {
    return "Лучше всего даст прирост короткая ежедневная практика по формулам, графикам и типовым задачам.";
  }

  if (subjectLabel === "Обществознание") {
    return "Сильнее всего поможет повтор терминов, логики заданий и примеров из экономики, права и политики.";
  }

  return "Быстрее всего результат растёт, когда регулярно закрываешь орфографию, пунктуацию и работу с текстом.";
}

function getLevelDescription(levelLabel?: string) {
  if (levelLabel === "Уверенный") {
    return "База уже собрана. Сейчас важно закрепить темп и точечно добрать сложные темы.";
  }

  if (levelLabel === "Базовый") {
    return "Основа есть, но пока результат плавает от темы к теме. Нужна спокойная системная практика.";
  }

  return "Сейчас лучше идти короткими шагами и сначала вернуть уверенность в ключевых темах.";
}

function buildSevenDayPlan(weakTopics: string[]) {
  const topics = weakTopics.length
    ? weakTopics.slice(0, 3)
    : ["главные ошибки диагностики", "типовые задания", "повтор сложных мест"];

  return [
    {
      day: "День 1",
      title: `Разобрать тему: ${topics[0]}`,
      text: "Понять, где именно теряются баллы, и пройти короткую тренировку.",
    },
    {
      day: "День 2",
      title: `Закрепить тему: ${topics[0]}`,
      text: "Сделать задания без спешки и повторить ошибки.",
    },
    {
      day: "День 3",
      title: `Перейти к теме: ${topics[1] || topics[0]}`,
      text: "Закрыть вторую слабую зону и собрать первые уверенные ответы.",
    },
    {
      day: "День 4",
      title: `Повторить тему: ${topics[1] || topics[0]}`,
      text: "Проверить, что ошибка не повторяется на похожих заданиях.",
    },
    {
      day: "День 5",
      title: `Прокачать тему: ${topics[2] || topics[0]}`,
      text: "Добрать третью слабую тему и сделать мини-тренировку.",
    },
    {
      day: "День 6",
      title: "Мини-вариант",
      text: "Проверить прогресс на коротком варианте без перегруза.",
    },
    {
      day: "День 7",
      title: "Контрольный срез",
      text: "Сравнить результат с первым днём и понять, что тренировать дальше.",
    },
  ];
}

export default function ResultPage() {
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    trackClientEvent("diagnosis_result_view");
    setDiagnosisResult(getDiagnosisResult());
  }, []);

  const subjectLabel = getSubjectLabel(diagnosisResult?.subject);
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const levelLabel = diagnosisResult?.levelLabel ?? "Нужна опора";
  const correctAnswers = diagnosisResult?.correctAnswers ?? 0;
  const totalQuestions = diagnosisResult?.totalQuestions ?? 6;
  const advice = useMemo(() => getSubjectAdvice(subjectLabel), [subjectLabel]);
  const sevenDayPlan = useMemo(() => buildSevenDayPlan(weakTopics), [weakTopics]);
  const topWeakTopics = weakTopics.length ? weakTopics.slice(0, 3) : ["ошибки диагностики", "типовые задания", "повтор сложных мест"];

  return (
    <main className="min-h-[100dvh] px-4 py-4 text-slate-900">
      <TopMenu subtitle="результат" />
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
        <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>Стартовый срез</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Картина собрана
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100/80 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,242,255,0.92))] p-5 shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Твой результат</p>
              <h1 className="mt-3 text-[2.15rem] font-black leading-[1.03] tracking-tight text-slate-950">
                Вот где теряются баллы и что делать следующие 7 дней
              </h1>
            </div>
            <div className="rounded-[1.4rem] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(99,102,241,0.1)]">
              <p className="text-xs font-medium text-slate-500">Верно</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{correctAnswers}/{totalQuestions}</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Мы посмотрели 6 вопросов по предмету {subjectLabel.toLowerCase()}. Теперь есть не просто оценка, а понятный маршрут: какие темы подтянуть и с чего начать.
          </p>

          <div className="mt-5 rounded-[1.7rem] bg-[linear-gradient(135deg,#312e81_0%,#4338ca_55%,#6366f1_100%)] p-4 text-white shadow-[0_22px_45px_rgba(79,70,229,0.28)]">
            <p className="text-sm font-medium text-indigo-100">Текущий уровень</p>
            <p className="mt-2 text-3xl font-black tracking-tight">{levelLabel}</p>
            <p className="mt-2 text-sm leading-6 text-indigo-100/88">{getLevelDescription(levelLabel)}</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">3 слабые темы</p>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                приоритет
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {topWeakTopics.map((topic, index) => (
                <div
                  key={`${topic}-${index}`}
                  className="flex items-start gap-3 rounded-[1.4rem] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,247,237,0.92))] px-4 py-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{topic}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-blue-100 bg-blue-50 p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">План на 7 дней</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              Открой ребёнку план на 7 дней
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Мы уже нашли слабые темы. Дальше ребёнку нужен не хаос из случайных заданий, а короткий маршрут: каждый день — тренировка на 10–15 минут.
            </p>

            <div className="mt-4 space-y-2">
              {sevenDayPlan.map((item) => (
                <div key={item.day} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">{item.day}</p>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                      10–15 мин
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Что тренировать дальше</p>
            <p className="mt-3 text-base font-semibold leading-7 text-slate-900">
              Направление уже найдено. Теперь важнее ритм тренировок, а не новые догадки.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{advice}</p>
          </div>

          <div className="rounded-[1.8rem] border border-rose-100 bg-rose-50 p-5 shadow-[0_18px_45px_rgba(244,63,94,0.08)]">
            <p className="text-sm font-black text-slate-950">
              Что будет, если не закрепить результат?
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              <div>— ребёнок снова будет выбирать задания наугад;</div>
              <div>— ошибки быстро забудутся;</div>
              <div>— слабые темы останутся без тренировки;</div>
              <div>— прогресс будет непонятен.</div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-emerald-100 bg-emerald-50 p-5 shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
            <p className="text-sm font-black text-slate-950">
              Что откроется за 199 ₽
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
              <div>✅ задания по 3 слабым темам;</div>
              <div>✅ ежедневный план на 10–15 минут;</div>
              <div>✅ мини-варианты;</div>
              <div>✅ повтор ошибок;</div>
              <div>✅ прогресс и доступ через Telegram.</div>
            </div>
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950">
              199 ₽ — разовый доступ на 7 дней. Без автосписаний.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 mt-auto rounded-[1.8rem] border border-indigo-100/80 bg-white/88 p-3 shadow-[0_18px_40px_rgba(99,102,241,0.14)] backdrop-blur-xl">
          <a
            href="/task-training?source=result_free_training"
            onClick={() =>
              trackClientEvent("result_free_training_click", {
                source: "diagnostic_result",
              })
            }
            className="block rounded-2xl bg-blue-600 px-4 py-4 text-center text-sm font-black text-white shadow-lg shadow-blue-600/20"
          >
            Начать бесплатную тренировку
          </a>

          <a
            href="https://t.me/ege_trainer_demo_bot?start=site_diagnostic_result"
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackClientEvent("telegram_save_result_click", {
                source: "diagnostic_result",
              })
            }
            className="mt-3 block rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-black text-slate-950"
          >
            Сохранить результат в Telegram
          </a>

          <a
            href="https://t.me/ege_trainer_demo_bot?start=buy_weekly_after_diagnostic"
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackClientEvent("result_pro_telegram_click", {
                source: "diagnostic_result",
                offer: "weekly_199_after_free_training",
              })
            }
            className="mt-3 block rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center text-sm font-black text-blue-700"
          >
            Открыть ребёнку план на 7 дней — 199 ₽
          </a>

          <p className="mt-2 text-center text-xs leading-5 text-slate-500">
            199 ₽ — разовый доступ на 7 дней. Без подписки и автосписаний.
          </p>
        </div>
      </div>
    </main>
  );
}
