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

const positiveFeedback = ["Супер ✨", "Отлично 🔥", "Точно 💫", "Сильный ход ✅", "Так держать 🚀"];
const gentleFeedback = ["Почти 👀", "Разберём 📘", "Бывает 🌿", "Спокойно, идём дальше ✍️", "Уже ближе 💡"];

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
  const feedbackLabel = isCorrect
    ? positiveFeedback[currentIndex % positiveFeedback.length]
    : gentleFeedback[currentIndex % gentleFeedback.length];

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
      <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
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
    <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Мини-вариант ЕГЭ</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Вариант {variant.variantNumber}</p>
            <p className="text-sm text-slate-400">{subjectLabel}</p>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Задание {currentIndex + 1} из {totalQuestions}
          </p>

          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">Мини-вариант ЕГЭ</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Вариант на 12 вопросов, чтобы проверить темп, выносливость и собранность по предмету.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {currentQuestion.topic}
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
              {currentQuestion.prompt}
            </h2>

            <div className="mt-4 space-y-2.5">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-medium leading-6 transition ${
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
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-900">
                <p className="text-sm font-medium text-slate-700">{feedbackLabel}</p>
                <p className="mt-1.5 text-sm font-medium">{isCorrect ? "Верно" : "Неверно"}</p>
                <p className="mt-1.5 text-sm font-medium text-slate-900">
                  Правильный ответ: {currentQuestion.correctAnswer}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-slate-600">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 mt-3 -mx-4 border-t border-slate-100 bg-white/95 px-4 pt-3 pb-1 backdrop-blur">
            {!showResult ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={!selectedAnswer}
                className={`primary-cta ${selectedAnswer ? "" : "is-disabled"}`}
              >
                <span className={`block leading-none ${selectedAnswer ? "text-white" : "text-slate-400"}`}>
                  Проверить ответ
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="primary-cta"
              >
                <span className="block leading-none text-white">
                  {isLastQuestion ? "Завершить мини-вариант" : "Следующее задание"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
