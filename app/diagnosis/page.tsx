"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getDiagnosisQuestions, type BankQuestion } from "@/lib/questionBank";
import {
  getStudentProfile,
  getSubjectLabel,
  normalizeSubjectKey,
  saveDiagnosisResult,
} from "@/lib/storage";

function getLevelLabel(correctAnswers: number) {
  if (correctAnswers >= 5) return "Уверенный";
  if (correctAnswers >= 3) return "Базовый";
  return "Нужна опора";
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [subject, setSubject] = useState(normalizeSubjectKey(undefined));
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    setSubject(nextSubject);
    setQuestions(getDiagnosisQuestions(nextSubject, 6));
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const subjectLabel = getSubjectLabel(subject);

  const summary = useMemo(() => {
    if (questions.length === 0) return null;

    const correctAnswers = questions.filter(
      (question) => answers[question.id] === question.correctAnswer,
    ).length;

    const wrongTopicsCount = questions.reduce<Record<string, number>>((accumulator, question) => {
      if (answers[question.id] && answers[question.id] !== question.correctAnswer) {
        accumulator[question.topic] = (accumulator[question.topic] ?? 0) + 1;
      }
      return accumulator;
    }, {});

    const weakTopics = Object.entries(wrongTopicsCount)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      correctAnswers,
      totalQuestions: questions.length,
      weakTopics: weakTopics.length > 0 ? weakTopics : [questions[0].topic],
      levelLabel: getLevelLabel(correctAnswers),
    };
  }, [answers, questions]);

  function handleSubmit() {
    if (!selectedAnswer || !currentQuestion) return;

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: selectedAnswer,
    }));
    setShowResult(true);
  }

  function handleNext() {
    if (!currentQuestion || !summary) return;

    if (isLastQuestion) {
      saveDiagnosisResult({
        subject,
        levelLabel: summary.levelLabel,
        weakTopics: summary.weakTopics,
        completedDiagnosis: true,
        correctAnswers: summary.correctAnswers,
        totalQuestions: summary.totalQuestions,
      });
      router.push("/result");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer("");
    setShowResult(false);
  }

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Собираем диагностику</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Подбираем вопросы под выбранный предмет.
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
          <span>Диагностика</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Вопрос {currentIndex + 1} из {questions.length}
            </p>
            <p className="text-sm text-slate-400">{subjectLabel}</p>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Тема: {currentQuestion.topic}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
              {currentQuestion.prompt}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Это не экзамен. Мы просто быстро определяем твой текущий уровень.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-medium transition ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {isCorrect ? "Верно" : "Неверно"}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Правильный ответ: {currentQuestion.correctAnswer}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          {!showResult ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`w-full rounded-3xl px-5 py-4 text-base font-semibold transition ${
                selectedAnswer
                  ? "bg-slate-900 text-white shadow-sm shadow-slate-300/40 hover:opacity-95"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              Ответить
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-3xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm shadow-slate-300/40 transition hover:opacity-95"
            >
              {isLastQuestion ? "Завершить диагностику" : "Следующий вопрос"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
