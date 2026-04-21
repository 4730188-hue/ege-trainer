"use client";

import Link from "next/link";
import { useState } from "react";

const questions = [
  {
    topic: "Пунктуация",
    question: "Где нужна запятая?",
    options: [
      "Когда наступил вечер мы пошли домой.",
      "Я люблю читать и рисовать.",
      "Он быстро встал и вышел.",
      "Ветер шумел и дождь стучал по окну.",
    ],
    correctAnswer: "Когда наступил вечер мы пошли домой.",
  },
  {
    topic: "Орфография",
    question: "В каком слове пропущена буква А?",
    options: ["к...саться", "р...стение", "предл...гать", "изл...жение"],
    correctAnswer: "р...стение",
  },
  {
    topic: "Лексика",
    question: "Какое слово употреблено в переносном значении?",
    options: ["золотое кольцо", "золотые руки", "золотая монета", "золотой браслет"],
    correctAnswer: "золотые руки",
  },
];

export default function SessionPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  function handlePrimaryAction() {
    if (!showResult) {
      if (!selectedAnswer) return;
      setShowResult(true);
      return;
    }

    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer("");
    setShowResult(false);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6">
        {!isFinished ? (
          <>
            <div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Задание {currentIndex + 1} из {questions.length}
              </p>
            </div>

            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight">
                Сессия на сегодня
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                5 заданий по слабым темам и 1 задание на повторение.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">{currentQuestion.topic}</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
                {currentQuestion.question}
              </h2>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left text-base font-medium transition ${
                      selectedAnswer === option
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="mt-6 rounded-2xl bg-white p-4 text-base font-medium text-slate-900">
                  {isCorrect
                    ? "Верно. Хорошо идешь."
                    : "Пока ошибка. Ничего страшного."}
                </div>
              )}

              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={!showResult && !selectedAnswer}
                className={`mt-6 w-full rounded-2xl px-5 py-4 text-base font-semibold text-white transition ${
                  !showResult && !selectedAnswer
                    ? "bg-slate-300"
                    : "bg-slate-900 hover:opacity-95"
                }`}
              >
                {showResult ? "Следующее задание" : "Проверить ответ"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Готово</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
                Сессия завершена
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Ты прошел сегодняшнюю тренировку.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/home"
                  className="block rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold text-white transition hover:opacity-95"
                >
                  Вернуться на главную
                </Link>
                <Link
                  href="/progress"
                  className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-base font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Посмотреть прогресс
                </Link>
              </div>
            </div>
          </>
        )}

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Link
              href="/home"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500"
            >
              Главная
            </Link>
            <Link
              href="/progress"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500"
            >
              Прогресс
            </Link>
            <Link
              href="/profile"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500"
            >
              Профиль
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
