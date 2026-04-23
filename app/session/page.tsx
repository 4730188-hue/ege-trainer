"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildSessionQuestions, type BankQuestion } from "@/lib/questionBank";
import {
  addSeenSessionQuestionIds,
  clearQuestionIncorrect,
  getIncorrectQuestionCount,
  getIncorrectQuestionIds,
  getStudentProfile,
  getSubjectLabel,
  getSeenSessionQuestionIds,
  incrementSessionsCompleted,
  markQuestionIncorrect,
  normalizeSubjectKey,
  type SessionProgress,
} from "@/lib/storage";

export default function SessionPage() {
  const [subject, setSubject] = useState(normalizeSubjectKey(undefined));
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [repeatCount, setRepeatCount] = useState(0);

  useEffect(() => {
    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    const seenIds = getSeenSessionQuestionIds(nextSubject);
    const incorrectIds = getIncorrectQuestionIds(nextSubject);
    const nextQuestions = buildSessionQuestions(nextSubject, {
      count: 5,
      seenIds,
      incorrectIds,
    });

    setSubject(nextSubject);
    setQuestions(nextQuestions);
    setRepeatCount(incorrectIds.length);

    if (nextQuestions.length > 0) {
      addSeenSessionQuestionIds(
        nextSubject,
        nextQuestions.map((question) => question.id),
      );
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const subjectLabel = getSubjectLabel(subject);

  function handlePrimaryAction() {
    if (!currentQuestion) return;

    if (!showResult) {
      if (!selectedAnswer) return;
      setShowResult(true);
      return;
    }

    if (!isCorrect) {
      markQuestionIncorrect(subject, currentQuestion.id);
    } else {
      clearQuestionIncorrect(subject, currentQuestion.id);
    }

    if (isLastQuestion) {
      const nextProgress = incrementSessionsCompleted();
      setSessionProgress(nextProgress);
      setRepeatCount(getIncorrectQuestionCount(subject));
      setIsFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer("");
    setShowResult(false);
  }

  if (!currentQuestion && !isFinished) {
    return (
      <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Подбираем задания</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Собираем сессию по выбранному предмету и темам на повторение.
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
          <span>Учебная сессия</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {isFinished ? "Готово" : `${currentIndex + 1}/${questions.length}`}
          </span>
        </div>

        {!isFinished ? (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Сессия на сегодня</p>
                <p className="text-sm text-slate-400">{subjectLabel}</p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Задание {currentIndex + 1} из {questions.length}
              </p>

              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
                Сессия на сегодня
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                5 заданий по предмету. Если есть ошибки в истории, стараемся вернуть хотя бы одно на повтор.
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
                    <p className="text-sm font-medium">{isCorrect ? "Верно" : "Неверно"}</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-900">
                      Правильный ответ: {currentQuestion.correctAnswer}
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-slate-600">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 mt-3 -mx-4 border-t border-slate-100 bg-white/95 px-4 pt-3 pb-1 backdrop-blur">
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={!showResult && !selectedAnswer}
                  className={`w-full rounded-2xl px-5 py-3.5 text-base font-semibold transition ${
                    !showResult && !selectedAnswer
                      ? "bg-slate-300"
                      : "bg-slate-900 hover:opacity-95"
                  }`}
                >
                  <span className="block leading-none text-white">
                    {showResult ? (isLastQuestion ? "Завершить сессию" : "Следующее задание") : "Проверить ответ"}
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              Сессия завершена
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900">
              Сессия завершена
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Ты прошёл тренировку по предмету {subjectLabel.toLowerCase()}.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Хороший темп. Можно вернуться на главную или сразу посмотреть прогресс.
              {sessionProgress && (
                <span className="mt-2 block">
                  Всего сессий: {sessionProgress.sessionsCompleted ?? 0}. Текущий streak: {sessionProgress.streakDays ?? 0}. На повторе сейчас: {repeatCount} вопросов.
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/home"
                className="block rounded-2xl bg-slate-900 px-5 py-4 text-center text-base font-semibold transition hover:opacity-95"
              >
                <span className="block leading-none text-white">Вернуться на главную</span>
              </Link>
              <Link
                href="/progress"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-base font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Посмотреть прогресс
              </Link>
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-slate-100 pt-4 pb-6">
          <div className="grid grid-cols-3 gap-2 text-sm items-center">
            <Link
              href="/home"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Главная</span>
            </Link>
            <Link
              href="/progress"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link
              href="/profile"
              className="rounded-2xl px-3 py-3 font-medium text-slate-500 text-center whitespace-nowrap"
            >
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
