"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDiagnosisResult, getSubjectLabel, type DiagnosisResult } from "@/lib/storage";

function getSubjectAdvice(subjectLabel: string) {
  if (subjectLabel === "Профильная математика") {
    return "Лучше всего даст прирост короткая ежедневная практика по базовым формулам, графикам и типовым задачам.";
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

export default function ResultPage() {
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    setDiagnosisResult(getDiagnosisResult());
  }, []);

  const subjectLabel = getSubjectLabel(diagnosisResult?.subject);
  const weakTopics = diagnosisResult?.weakTopics ?? [];
  const levelLabel = diagnosisResult?.levelLabel ?? "Нужна опора";
  const correctAnswers = diagnosisResult?.correctAnswers ?? 0;
  const totalQuestions = diagnosisResult?.totalQuestions ?? 6;
  const advice = useMemo(() => getSubjectAdvice(subjectLabel), [subjectLabel]);

  return (
    <main className="min-h-[100dvh] px-4 py-4 text-slate-900">
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Твой старт</p>
              <h1 className="mt-3 text-[2.25rem] font-black leading-[1.03] tracking-tight text-slate-950">
                Теперь видно, где ты уже силён и куда именно бить дальше.
              </h1>
            </div>
            <div className="rounded-[1.4rem] border border-white/80 bg-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(99,102,241,0.1)]">
              <p className="text-xs font-medium text-slate-500">Верно</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{correctAnswers}/{totalQuestions}</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Мы посмотрели 6 вопросов по предмету {subjectLabel.toLowerCase()}. Теперь стартовый срез собран, и дальше можно переходить в понятный режим тренировки.
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Зоны роста</p>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                приоритет
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic, index) => (
                  <div
                    key={topic}
                    className="flex items-start gap-3 rounded-[1.4rem] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,247,237,0.92))] px-4 py-3"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-700">{topic}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(220,252,231,0.88))] px-4 py-3 text-sm leading-6 text-slate-700">
                  Явных провалов не нашли. Можно спокойно наращивать темп и закреплять сильную базу.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Что тренировать дальше</p>
            <p className="mt-3 text-base font-semibold leading-7 text-slate-900">
              Направление уже найдено. Теперь важнее ритм тренировок, а не новые догадки.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{advice}</p>
          </div>
        </div>

        <div className="sticky bottom-0 mt-auto rounded-[1.8rem] border border-indigo-100/80 bg-white/80 p-3 shadow-[0_18px_40px_rgba(99,102,241,0.14)] backdrop-blur-xl">
          <p className="mb-2 text-center text-xs font-medium text-slate-500">Следующий шаг переведёт тебя из стартового среза в персональный режим тренировки</p>
          <Link
            href="/paywall"
            className="primary-cta"
          >
            <span className="block leading-none text-white">Перейти к первой сильной сессии</span>
          </Link>

          <p className="mt-2 text-center text-sm text-slate-500">Дальше начнётся персональный маршрут примерно на 7 минут</p>
        </div>
      </div>
    </main>
  );
}
