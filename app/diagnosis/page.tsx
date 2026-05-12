"use client";

import { trackClientEvent } from "@/lib/clientAnalytics";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getDiagnosisQuestions, type BankQuestion, type SubjectKey } from "@/lib/questionBank";
import TopMenu from "@/app/components/TopMenu";
import {
  getSubjectLabel,
  saveDiagnosisResult,
} from "@/lib/storage";

function getLevelLabel(correctAnswers: number, totalQuestions: number) {
  const ratio = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

  if (ratio >= 0.75) return "Уверенный старт";
  if (ratio >= 0.45) return "Есть база, но темы проседают";
  return "Нужен понятный план";
}

const diagnosisSubjects: SubjectKey[] = ["russian", "math", "social"];

const positiveFeedback = ["Супер ✨", "Отлично 🔥", "Точно 💫", "Сильный ход ✅", "Так держать 🚀"];
const gentleFeedback = ["Почти 👀", "Разберём 📘", "Бывает 🌿", "Спокойно, идём дальше ✍️", "Уже ближе 💡"];

function buildReasoningHint(question: BankQuestion) {
  if (question.solutionSteps) return question.solutionSteps;

  if (question.topic.toLowerCase().includes("текст")) {
    return "Сначала пойми, что именно спрашивают о тексте, затем ищи ответ в функции фрагмента или главной мысли.";
  }

  if (
    question.topic.toLowerCase().includes("функ") ||
    question.topic.toLowerCase().includes("уравн") ||
    question.topic.toLowerCase().includes("геометр")
  ) {
    return "Сначала выпиши правило или формулу, потом проверь каждый шаг вычисления без спешки.";
  }

  return "Сначала определи правило или признак, который проверяется, а затем сравни варианты ответа с этим правилом.";
}

function buildTrapHint(question?: BankQuestion) {
  return question?.commonMistake ?? "Типичная ловушка — выбрать ответ по знакомому слову или ощущению и не проверить его по правилу.";
}

function buildThreeSubjectDiagnosis() {
  return diagnosisSubjects.flatMap((subject) =>
    getDiagnosisQuestions(subject, 3).map((question) => ({
      ...question,
      subject,
    }))
  );
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    trackClientEvent("diagnosis_open", {
      mode: "three_subjects",
    });
    setQuestions(buildThreeSubjectDiagnosis());
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const subjectLabel = getSubjectLabel(currentQuestion?.subject);
  const feedbackLabel = isCorrect
    ? positiveFeedback[currentIndex % positiveFeedback.length]
    : gentleFeedback[currentIndex % gentleFeedback.length];

  const summary = useMemo(() => {
    if (questions.length === 0) return null;

    const correctAnswers = questions.filter(
      (question) => answers[question.id] === question.correctAnswer
    ).length;

    const weakTopicsCount = questions.reduce<Record<string, number>>((accumulator, question) => {
      if (answers[question.id] && answers[question.id] !== question.correctAnswer) {
        accumulator[question.topic] = (accumulator[question.topic] ?? 0) + 1;
      }
      return accumulator;
    }, {});

    const weakTopics = Object.entries(weakTopicsCount)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    const subjectScores = diagnosisSubjects.map((subject) => {
      const subjectQuestions = questions.filter((question) => question.subject === subject);
      const subjectCorrectAnswers = subjectQuestions.filter(
        (question) => answers[question.id] === question.correctAnswer
      ).length;

      const subjectWeakTopics = subjectQuestions
        .filter((question) => answers[question.id] && answers[question.id] !== question.correctAnswer)
        .map((question) => question.topic)
        .slice(0, 3);

      return {
        subject,
        label: getSubjectLabel(subject),
        correctAnswers: subjectCorrectAnswers,
        totalQuestions: subjectQuestions.length,
        weakTopics: subjectWeakTopics.length > 0 ? subjectWeakTopics : [subjectQuestions[0]?.topic || "стартовая тема"],
      };
    });

    return {
      correctAnswers,
      totalQuestions: questions.length,
      weakTopics: weakTopics.length > 0 ? weakTopics : subjectScores.flatMap((score) => score.weakTopics).slice(0, 3),
      levelLabel: getLevelLabel(correctAnswers, questions.length),
      subjectScores,
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
        subject: "russian",
        levelLabel: summary.levelLabel,
        weakTopics: summary.weakTopics,
        completedDiagnosis: true,
        correctAnswers: summary.correctAnswers,
        totalQuestions: summary.totalQuestions,
        subjectScores: summary.subjectScores,
      });

      trackClientEvent("three_subject_diagnosis_completed", {
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
      <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
        <TopMenu subtitle="диагностика" showExitToHome />
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Собираем диагностику</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Подбираем короткий срез по русскому, математике и обществознанию.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
      <TopMenu subtitle="диагностика" showExitToHome />
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Срез по 3 предметам</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Вопрос {currentIndex + 1} из {questions.length}
            </p>
            <p className="text-sm font-bold text-blue-600">{subjectLabel}</p>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Тема: {currentQuestion.topic}</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight">
                {currentQuestion.prompt}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Это не экзамен. Мы быстро собираем картину по 3 предметам.
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full rounded-3xl border px-4 py-3.5 text-left text-sm font-medium leading-6 transition ${
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
              <div className={`mt-4 rounded-3xl border p-3.5 ${isCorrect ? "border-emerald-100 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="text-sm font-medium text-slate-700">{isCorrect ? "Сильный ход" : "Разбор ответа"}</p>
                <p className="mt-1.5 text-sm text-slate-600">{feedbackLabel}</p>

                <div className="mt-3 space-y-2.5">
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">Правильный ответ</p>
                    <p className="mt-1.5 text-sm leading-5 text-slate-700">{currentQuestion.correctAnswer}</p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">{isCorrect ? "Почему это верно" : "Почему так"}</p>
                    <p className="mt-1.5 text-sm leading-5 text-slate-700">{currentQuestion.explanation}</p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-slate-900">Как рассуждать</p>
                    <p className="mt-1.5 text-sm leading-5 text-slate-600">{buildReasoningHint(currentQuestion)}</p>
                  </div>

                  {!isCorrect && (
                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">Типичная ловушка</p>
                      <p className="mt-1.5 text-sm leading-5 text-slate-600">{buildTrapHint(currentQuestion)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-4 mt-auto pt-4">
            {!showResult ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`w-full rounded-full px-5 py-4 text-base font-semibold shadow-sm transition ${
                  selectedAnswer
                    ? "bg-slate-900 text-white shadow-slate-300/40"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                Проверить ответ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="w-full rounded-full bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-600 px-5 py-4 text-base font-semibold text-white shadow-sm shadow-indigo-200/50 transition"
              >
                {isLastQuestion ? "Показать план" : "Следующий вопрос"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
