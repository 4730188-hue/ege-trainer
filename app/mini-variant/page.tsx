"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMiniVariantsBySubject, type MiniVariant } from "@/lib/questionBank";
import {
  getLastMiniVariantIndex,
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  saveMiniVariantResult,
  setLastMiniVariantSelection,
} from "@/lib/storage";

function getNextVariant(subject: ReturnType<typeof normalizeSubjectKey>) {
  const variants = getMiniVariantsBySubject(subject);

  if (variants.length === 0) {
    return { variant: null as MiniVariant | null, index: -1 };
  }

  const lastIndex = getLastMiniVariantIndex(subject);
  const nextIndex = (lastIndex + 1) % variants.length;

  return {
    variant: variants[nextIndex],
    index: nextIndex,
  };
}

export default function MiniVariantPage() {
  const router = useRouter();
  const [subject, setSubject] = useState(normalizeSubjectKey(undefined));
  const [variant, setVariant] = useState<MiniVariant | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    const nextVariant = getNextVariant(nextSubject);

    setSubject(nextSubject);
    setVariant(nextVariant.variant);

    if (nextVariant.variant && nextVariant.index >= 0) {
      setLastMiniVariantSelection(nextSubject, nextVariant.index, nextVariant.variant.id);
    }
  }, []);

  const currentQuestion = variant?.questions[currentIndex];
  const totalQuestions = variant?.questions.length ?? 0;
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const subjectLabel = getSubjectLabel(subject);
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  function handleCheck() {
    if (!currentQuestion || !selectedAnswer) return;

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: selectedAnswer,
    }));
    setShowResult(true);
  }

  function handleNext() {
    if (!variant || !currentQuestion) return;

    if (isLastQuestion) {
      const correctAnswers = variant.questions.filter(
        (question) => answers[question.id] === question.correctAnswer,
      ).length;

      saveMiniVariantResult({
        subject,
        variantId: variant.id,
        variantNumber: variant.variantNumber,
        correctAnswers,
        totalQuestions: variant.questions.length,
      });

      router.push("/mini-variant-result");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer("");
    setShowResult(false);
  }

  if (!variant || !currentQuestion) {
    return (
      <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Готовим мини-вариант</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Подбираем вариант по выбранному предмету.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Мини-вариант ЕГЭ</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Вариант {variant.variantNumber}</p>
            <p className="text-sm text-slate-400">{subjectLabel}</p>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Задание {currentIndex + 1} из {totalQuestions}
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight">Мини-вариант ЕГЭ</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Короткий вариант на 8 вопросов, чтобы проверить темп и собранность по предмету.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {currentQuestion.topic}
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900">
            {currentQuestion.prompt}
          </h2>

          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedAnswer(option)}
                className={`w-full rounded-2xl border px-5 py-4 text-left text-base font-medium transition ${
                  selectedAnswer === option
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                    : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {showResult && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900">
              <p className="font-medium">{isCorrect ? "Верно" : "Неверно"}</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Правильный ответ: {currentQuestion.correctAnswer}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{currentQuestion.explanation}</p>
            </div>
          )}

          {!showResult ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className={`mt-6 w-full rounded-2xl px-5 py-4 text-base font-semibold transition ${
                selectedAnswer
                  ? "bg-slate-900 hover:opacity-95"
                  : "bg-slate-300"
              }`}
            >
              <span className="block leading-none text-white">Проверить ответ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold transition hover:opacity-95"
            >
              <span className="block leading-none text-white">
                {isLastQuestion ? "Завершить мини-вариант" : "Следующее задание"}
              </span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
