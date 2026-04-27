"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getMiniVariantProgress,
  getSubjectLabel,
  type MiniVariantResult,
} from "@/lib/storage";

function getComment(correctAnswers: number, totalQuestions: number) {
  const ratio = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

  if (ratio >= 0.875) {
    return "Очень уверенно. Можно брать следующий мини-вариант и держать темп.";
  }

  if (ratio >= 0.625) {
    return "Хорошая база. Ещё немного точности, и результат станет заметно стабильнее.";
  }

  if (ratio >= 0.375) {
    return "Есть рабочая основа, но пока стоит спокойно добирать темы и повторять ошибки.";
  }

  return "Пока тяжеловато, но это нормальная точка старта. Следующий вариант поможет увидеть прогресс.";
}

export default function MiniVariantResultPage() {
  const [result, setResult] = useState<MiniVariantResult | null>(null);

  useEffect(() => {
    setResult(getMiniVariantProgress().lastResult ?? null);
  }, []);

  const subjectLabel = getSubjectLabel(result?.subject);
  const correctAnswers = result?.correctAnswers ?? 0;
  const totalQuestions = result?.totalQuestions ?? 20;
  const variantNumber = result?.variantNumber ?? 1;
  const comment = getComment(correctAnswers, totalQuestions);

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Результат мини-варианта</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Готово
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-500">{subjectLabel}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
            Мини-вариант {variantNumber} завершён
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Верных ответов: {correctAnswers} из {totalQuestions}.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Комментарий</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{comment}</p>
        </div>

        <div className="mt-auto space-y-3 pb-4">
          <Link
            href="/mini-variant"
            className="primary-cta"
          >
            <span className="block leading-none text-white">Попробовать следующий вариант</span>
          </Link>
          <Link
            href="/home"
            className="secondary-cta text-slate-700"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
}
