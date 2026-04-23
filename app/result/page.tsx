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
    <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Результат диагностики</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Готово
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              Твоя стартовая картина готова
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Мы посмотрели 6 вопросов по предмету {subjectLabel.toLowerCase()}. Верных ответов: {correctAnswers} из {totalQuestions}.
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Текущий уровень
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{levelLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{getLevelDescription(levelLabel)}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Слабые темы
              </p>

              <div className="space-y-2.5">
                {weakTopics.map((topic) => (
                  <div
                    key={topic}
                    className="rounded-3xl bg-slate-50 p-3.5 text-sm font-medium text-slate-900"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Что делать дальше
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{advice}</p>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-0 mt-auto bg-slate-100/95 pt-1 pb-1 backdrop-blur">
            <Link
              href="/paywall"
              className="block w-full rounded-3xl bg-slate-900 px-5 py-3.5 text-center text-base font-semibold text-white shadow-sm shadow-slate-300/40 transition hover:opacity-95"
            >
              <span className="block leading-none text-white">Начать первую сессию</span>
            </Link>

            <p className="mt-2 text-center text-sm text-slate-500">
              Первая сессия займёт около 7 минут
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
