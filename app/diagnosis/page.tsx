"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const questions = [
  {
    id: 1,
    topic: "Орфография",
    title: "В каком слове пропущена буква А?",
    options: ["к...саться", "р...стение", "предл...гать", "изл...жение"],
    correctAnswer: "р...стение",
  },
  {
    id: 2,
    topic: "Пунктуация",
    title: "Укажите предложение, где нужна одна запятая.",
    options: [
      "Солнце взошло и осветило лес.",
      "Я взял книгу и тетрадь и вышел.",
      "На улице было тихо но холодно.",
      "Мы быстро собрались и уехали домой.",
    ],
    correctAnswer: "На улице было тихо но холодно.",
  },
  {
    id: 3,
    topic: "Лексика",
    title: "Укажите слово, употреблённое в неверном значении.",
    options: [
      "эффектный выход",
      "эффективный метод",
      "каменистая почва",
      "каменный характер",
    ],
    correctAnswer: "каменный характер",
  },
];

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  function handleSubmit() {
    if (!selectedAnswer) return;
    setShowResult(true);
  }

  function handleNext() {
    if (isLastQuestion) {
    router.push("/result");
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer("");
    setShowResult(false);
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Вопрос {currentIndex + 1} из {questions.length}
            </p>
            <p className="text-sm text-slate-400">Диагностика</p>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-slate-500">
            Тема: {currentQuestion.topic}
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {currentQuestion.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Это не экзамен. Мы просто оцениваем текущий уровень.
          </p>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedAnswer(option)}
                className={`w-full rounded-2xl border px-5 py-4 text-left text-base font-medium transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div
            className={`mt-6 rounded-3xl border p-5 ${
              isCorrect
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {isCorrect ? "Верно" : "Ответ сохранён"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {isCorrect
                ? "Хорошо. Это задание уже выглядит уверенно."
                : "Ничего страшного. Диагностика нужна как раз для того, чтобы найти слабые места."}
            </p>
          </div>
        )}

        <div className="mt-auto pt-8">
          {!showResult ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`w-full rounded-2xl px-5 py-4 text-base font-semibold transition ${
                selectedAnswer
                  ? "bg-slate-900 text-white hover:opacity-95"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              Ответить
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:opacity-95"
            >
              {isLastQuestion ? "Завершить диагностику" : "Следующий вопрос"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}