"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMiniVariantsBySubject, type MiniVariant } from "@/lib/questionBank";
import TopMenu from "@/app/components/TopMenu";
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

function getQuestionMeta(question: NonNullable<MiniVariant["questions"][number]>) {
  return `${question.examLabel ?? "Формат ЕГЭ"} · ${question.skillLabel ?? question.topic}`;
}

function buildRepeatHint(question: NonNullable<MiniVariant["questions"][number]>) {
  return question.repeatHint ?? `${question.skillLabel ?? question.topic}: повтори правило, затем проверь похожее задание в обычной тренировке.`;
}

function buildReasoningHint(question: NonNullable<MiniVariant["questions"][number]>) {
  if (question.solutionSteps) return question.solutionSteps;
  if (question.topic.toLowerCase().includes("эконом")) {
    return "Сначала выдели ключевое общественное явление или термин, затем сравни его с признаками в вариантах ответа.";
  }

  if (question.topic.toLowerCase().includes("функ") || question.topic.toLowerCase().includes("уравн")) {
    return "Сначала выпиши формулу или связь между величинами, затем считай шаг за шагом без устных прыжков.";
  }

  if (question.topic.toLowerCase().includes("пунктуа") || question.topic.toLowerCase().includes("орф")) {
    return "Сначала определи правило, которое проверяется, и только потом выбирай ответ, а не наоборот.";
  }

  return "Сначала пойми, что именно проверяется в задании, затем убери явно слабые варианты и проверь лучший ответ по правилу.";
}

function buildTrapHint(question: NonNullable<MiniVariant["questions"][number]>) {
  if (question.commonMistake) return question.commonMistake;

  if (question.topic.toLowerCase().includes("право") || question.topic.toLowerCase().includes("полит")) {
    return "Ловушка в похожих терминах: ответ кажется знакомым, но не совпадает по точному признаку.";
  }

  return "Типичная ловушка, выбрать вариант по ощущению и не сверить его с формулировкой задания.";
}

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
      <TopMenu subtitle="мини-вариант" showExitToHome />
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Готовим мини-вариант</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Подбираем 20 заданий по предмету: проверка темпа, устойчивости и формата ЕГЭ.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
      <TopMenu subtitle="мини-вариант" showExitToHome />
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
            20 заданий по формату ЕГЭ: моментальная проверка, решения и разбор ошибок после ответа.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {getQuestionMeta(currentQuestion)}
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
              <div
                className={`mt-4 rounded-2xl border p-3.5 text-slate-900 ${
                  isCorrect ? "border-emerald-100 bg-emerald-50" : "border-rose-100 bg-rose-50"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {isCorrect ? "Сильный ход" : "Разбор ответа"}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-700">{feedbackLabel}</p>

                <div className="mt-3 space-y-2.5">
                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">Правильный ответ</p>
                    <p className="mt-1 text-sm leading-5 text-slate-700">{currentQuestion.correctAnswer}</p>
                  </div>

                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">{isCorrect ? "Почему это верно" : "Почему так"}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{currentQuestion.explanation}</p>
                  </div>

                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">Как рассуждать</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{buildReasoningHint(currentQuestion)}</p>
                  </div>

                  {!isCorrect && (
                    <div className="rounded-xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">Типичная ловушка</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{buildTrapHint(currentQuestion)}</p>
                    </div>
                  )}

                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">Что повторить</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{buildRepeatHint(currentQuestion)}</p>
                  </div>

                  <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">Что дальше</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {isCorrect
                        ? "Коротко закрепи ход решения и попробуй сохранить ту же логику на следующем задании."
                        : "Это задание попадёт в повтор, чтобы ошибка вернулась в работу после варианта."}
                    </p>
                  </div>
                </div>
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
