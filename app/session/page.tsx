"use client";

import { trackClientEvent } from "@/lib/clientAnalytics";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildSessionQuestions,
  getTaskTypeGuide,
  QUESTION_BANK,
  type BankQuestion,
} from "@/lib/questionBank";
import {
  addSeenSessionQuestionIds,
  clearQuestionIncorrect,
  clearSelectedTaskType,
  clearReviewMode as clearStoredReviewMode,
  consumeFreeGateAccess,
  getDueReviewEntries,
  getIncorrectQuestionCount,
  getIncorrectQuestionIds,
  getPrioritizedIncorrectQuestionIds,
  getRepeatInsight,
  getReviewMode,
  getSelectedTaskType,
  getStudentProfile,
  getSubjectLabel,
  getSeenSessionQuestionIds,
  incrementSessionsCompleted,
  markQuestionIncorrect,
  normalizeSubjectKey,
  setReviewMode as setStoredReviewMode,
  type FreeGateStatus,
  type SessionProgress,
} from "@/lib/storage";

const positiveFeedback = ["Супер ✨", "Отлично 🔥", "Точно 💫", "Сильный ход ✅", "Так держать 🚀"];
const gentleFeedback = ["Почти 👀", "Разберём 📘", "Бывает 🌿", "Спокойно, идём дальше ✍️", "Уже ближе 💡"];

function getQuestionMeta(question?: BankQuestion | null) {
  if (!question) return "Формат ЕГЭ";
  return `${question.examLabel ?? "Формат ЕГЭ"} · ${question.skillLabel ?? question.topic}`;
}

function buildRepeatHint(question: BankQuestion) {
  return (
    question.repeatHint ??
    `${question.skillLabel ?? question.topic}: повтори правило, реши похожее задание и проверь, почему остальные варианты не подходят.`
  );
}

function buildReasoningHint(question: BankQuestion) {
  if (question.solutionSteps) return question.solutionSteps;

  if (question.taskType?.includes("пунктуа") || question.topic.toLowerCase().includes("пунктуа")) {
    return "Сначала найди грамматические основы или оборот, потом проверь, нужна ли здесь запятая по правилу.";
  }

  if (question.taskType?.includes("лекс") || question.topic.toLowerCase().includes("лекс")) {
    return "Сравни значения вариантов и отбрось слова, которые похожи по форме, но не подходят по смыслу.";
  }

  if (question.taskType?.includes("грам") || question.topic.toLowerCase().includes("грам")) {
    return "Проверь, как связаны слова в предложении: согласование, управление и кто выполняет действие.";
  }

  return "Сначала определи тип задания, затем вспомни правило и только после этого сверяй варианты ответа.";
}

function buildTrapHint(question: BankQuestion) {
  if (question.commonMistake) return question.commonMistake;

  if (question.taskType?.includes("орф") || question.topic.toLowerCase().includes("орф")) {
    return "Ловушка в том, что знакомое слово хочется выбрать по звучанию, а не по правилу написания.";
  }

  if (question.taskType?.includes("текст") || question.topic.toLowerCase().includes("текст")) {
    return "Ловушка в поверхностном чтении: ответ часто прячется не в отдельных словах, а в функции фрагмента или главной мысли.";
  }

  return "Типичная ловушка — отвечать слишком быстро и не проверить, какое именно правило здесь работает.";
}

function buildNextStepHint(isCorrect: boolean) {
  return isCorrect
    ? "Запомни ход решения и попробуй так же разобрать следующее задание без спешки."
    : "Это задание уйдёт на повтор, так что ты ещё вернёшься к нему и закрепишь решение спокойнее.";
}

function getSessionResultTitle(correctCount: number) {
  if (correctCount >= 13) return "Отлично, навык закрепляется";
  if (correctCount >= 9) return "Хорошая тренировка";
  return "Есть что разобрать";
}

function getPreciseNextStep(errorCount: number, focusLabel: string | null) {
  if (errorCount > 0) {
    const focus = focusLabel ? `«${focusLabel}»` : "слабых мест";
    return `Разбери ${errorCount} ошибок — начнём с темы ${focus}.`;
  }

  return "Ошибок нет — можно перейти к мини-варианту ЕГЭ.";
}

function AppHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-black leading-none text-white">
          ЕГЭ
        </span>
        <span className="text-lg font-black text-white">Plan</span>
      </Link>

      <div className="hidden text-sm font-bold text-slate-300 sm:block">{subtitle}</div>

      <div className="flex items-center gap-2">
        <Link
          href="/home"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white"
        >
          План
        </Link>
        <Link
          href="/account"
          className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white sm:block"
        >
          Кабинет
        </Link>
      </div>
    </header>
  );
}

export default function SessionPage() {
  const [subject, setSubject] = useState(normalizeSubjectKey(undefined));
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showLesson, setShowLesson] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [repeatCount, setRepeatCount] = useState(0);
  const [repeatFocusLabel, setRepeatFocusLabel] = useState<string | null>(null);
  const [selectedModeLabel, setSelectedModeLabel] = useState<string | null>(null);
  const [gateStatus, setGateStatus] = useState<FreeGateStatus | null>(null);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionIncorrectCount, setSessionIncorrectCount] = useState(0);
  const [isReviewSession, setIsReviewSession] = useState(false);

  useEffect(() => {
    trackClientEvent("session_open");

    const gate = consumeFreeGateAccess("session");
    setGateStatus(gate);

    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    const selectedTask = getSelectedTaskType(nextSubject);
    const seenIds = getSeenSessionQuestionIds(nextSubject);
    const incorrectIds = getIncorrectQuestionIds(nextSubject);
    const isReviewMode = Boolean(getReviewMode(nextSubject));
    const dueReviewIds = getDueReviewEntries(nextSubject).map((entry) => entry.questionId);
    const prioritizedIncorrectIds = Array.from(
      new Set([...dueReviewIds, ...getPrioritizedIncorrectQuestionIds(nextSubject), ...incorrectIds])
    );

    const reviewQuestions = prioritizedIncorrectIds
      .map((questionId) =>
        QUESTION_BANK.find((question) => question.subject === nextSubject && question.id === questionId)
      )
      .filter((question): question is BankQuestion => Boolean(question))
      .slice(0, 15);

    const candidateQuestions =
      isReviewMode && reviewQuestions.length > 0
        ? reviewQuestions
        : buildSessionQuestions(nextSubject, {
            count: 15,
            seenIds,
            incorrectIds: prioritizedIncorrectIds,
            taskType: selectedTask?.taskType,
          });

    const nextQuestions =
      isReviewMode && reviewQuestions.length > 0
        ? reviewQuestions
        : [...candidateQuestions]
            .sort((left, right) => {
              const leftPriority = prioritizedIncorrectIds.indexOf(left.id);
              const rightPriority = prioritizedIncorrectIds.indexOf(right.id);
              const leftRank = leftPriority === -1 ? 999 : leftPriority;
              const rightRank = rightPriority === -1 ? 999 : rightPriority;
              return leftRank - rightRank;
            })
            .slice(0, 15);

    setSubject(nextSubject);
    setQuestions(nextQuestions);
    setRepeatCount(incorrectIds.length);
    setRepeatFocusLabel(getRepeatInsight(nextSubject).priorityTaskTypeLabel ?? null);
    setIsReviewSession(isReviewMode && reviewQuestions.length > 0);
    setShowLesson(!(isReviewMode && reviewQuestions.length > 0));
    setSelectedModeLabel(
      isReviewMode && reviewQuestions.length > 0 ? "Разбор ошибок" : selectedTask?.label ?? null
    );

    if (nextQuestions.length > 0 && !(isReviewMode && reviewQuestions.length > 0)) {
      addSeenSessionQuestionIds(
        nextSubject,
        nextQuestions.map((question) => question.id)
      );
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
  const subjectLabel = getSubjectLabel(subject);

  const guide = useMemo(() => {
    const selectedTask = getSelectedTaskType(subject);
    return getTaskTypeGuide(selectedTask?.taskType ?? currentQuestion?.taskType ?? null);
  }, [subject, currentQuestion?.taskType]);

  const feedbackLabel = isCorrect
    ? positiveFeedback[currentIndex % positiveFeedback.length]
    : gentleFeedback[currentIndex % gentleFeedback.length];

  function handlePrimaryAction() {
    if (!currentQuestion) return;

    if (!showResult) {
      if (!selectedAnswer) return;
      setShowResult(true);
      return;
    }

    if (!isCorrect) {
      markQuestionIncorrect(subject, currentQuestion.id);
      setSessionIncorrectCount((prev) => prev + 1);
    } else {
      clearQuestionIncorrect(subject, currentQuestion.id);
      setSessionCorrectCount((prev) => prev + 1);
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

  if (gateStatus?.isBlocked && !gateStatus.inProgress && !gateStatus.isPro) {
    return (
      <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
          <AppHeader subtitle="тренировка" />

          <section className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-xl rounded-[2.2rem] border border-white/10 bg-white p-7 text-slate-950 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                🔒
              </div>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-amber-600">
                Free-лимит
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                Бесплатная тренировка на сегодня уже использована
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Pro открывает безлимитные тренировки, мини-варианты, повтор ошибок и прогресс.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/paywall?source=session_limit"
                  className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white shadow-xl shadow-blue-600/20"
                >
                  Открыть Pro
                </Link>
                <Link
                  href="/home"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  На главную
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!currentQuestion && !isFinished) {
    return (
      <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
          <AppHeader subtitle="подбираем задания" />

          <section className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-xl rounded-[2.2rem] border border-white/10 bg-white p-7 text-slate-950 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                ⏳
              </div>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                Подбираем задания
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                Собираем тренировку
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Берём задания из банка: слабые места, повтор ошибок и формат ЕГЭ.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (showLesson && !isFinished) {
    return (
      <main className="min-h-screen bg-[#050816] px-5 py-6 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
          <AppHeader subtitle={`${subjectLabel} · мини-урок`} />

          <section className="grid flex-1 gap-8 py-10 md:grid-cols-[1fr_0.9fr] md:items-center">
            <div>
              <p className="inline-flex rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-200">
                {selectedModeLabel ? "Тренировка по теме" : "Тренировка по слабым местам"}
              </p>
              <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                {guide?.title ?? repeatFocusLabel ?? "Рабочая сессия"}
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
                Сначала коротко вспоминаем правило, потом решаем 15 заданий и разбираем ошибки.
              </p>

              <button
                type="button"
                onClick={() => setShowLesson(false)}
                className="mt-8 rounded-2xl bg-blue-600 px-7 py-5 text-lg font-black text-white shadow-xl shadow-blue-600/20"
              >
                Начать 15 заданий
              </button>
            </div>

            <section className="rounded-[2.2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">
                Мини-урок
              </p>

              <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-900">Правило</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {guide?.rule ?? "Сначала внимательно определи тип задания, затем выбери стратегию решения."}
                </p>
              </div>

              <div className="mt-3 rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-black text-slate-900">Пример</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {guide?.example ?? "Смотри не только на ответ, но и на ход рассуждения."}
                </p>
              </div>

              <div className="mt-3 rounded-3xl bg-amber-50 p-5">
                <p className="text-sm font-black text-amber-800">Типичная ловушка</p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {guide?.trap ?? "Не отвечай на автомате: проверь условие и правило."}
                </p>
              </div>
            </section>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <section className="bg-[#050816] px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-6xl">
          <AppHeader subtitle={isReviewSession ? "разбор ошибок" : "тренировка"} />

          <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-300">
                {isFinished ? "Итог тренировки" : isReviewSession ? "Разбор ошибок" : "Учебная сессия"}
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                {isFinished
                  ? isReviewSession
                    ? "Ошибки разобраны"
                    : getSessionResultTitle(sessionCorrectCount)
                  : currentQuestion?.topic ?? "Задание"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                {isFinished
                  ? "Посмотрите итог и выберите следующий шаг."
                  : `${subjectLabel}. ${getQuestionMeta(currentQuestion)}.`}
              </p>
            </div>

            {!isFinished ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{currentIndex + 1} из {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white/10">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto max-w-6xl">
          {!isFinished ? (
            <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {currentQuestion.difficulty}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500">
                    {isReviewSession ? `Ошибка ${currentIndex + 1}` : `Задание ${currentIndex + 1}`}
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight">
                  {currentQuestion.prompt}
                </h2>

                <div className="mt-6 grid gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    const shouldHighlightCorrect = showResult && option === currentQuestion.correctAnswer;
                    const shouldHighlightWrong =
                      showResult && isSelected && option !== currentQuestion.correctAnswer;

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={showResult}
                        onClick={() => setSelectedAnswer(option)}
                        className={`rounded-[1.5rem] border px-5 py-4 text-left text-base font-bold transition ${
                          shouldHighlightCorrect
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : shouldHighlightWrong
                              ? "border-rose-300 bg-rose-50 text-rose-800"
                              : isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={!selectedAnswer && !showResult}
                  className={`mt-6 w-full rounded-2xl px-5 py-4 text-lg font-black transition ${
                    selectedAnswer || showResult
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {showResult
                    ? isLastQuestion
                      ? "Завершить тренировку"
                      : "Следующее задание"
                    : "Проверить ответ"}
                </button>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                {!showResult ? (
                  <>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      Подсказка
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Сначала подумайте по правилу
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Не спешите выбирать ответ. Определите тип задания, вспомните правило и только потом сравните варианты.
                    </p>

                    <div className="mt-5 rounded-3xl bg-blue-50 p-5">
                      <p className="text-sm font-black text-blue-700">Тема</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {currentQuestion.skillLabel ?? currentQuestion.topic}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      {isCorrect ? "Ответ верный" : "Разбор ответа"}
                    </p>
                    <h2 className="mt-2 text-3xl font-black">
                      {feedbackLabel}
                    </h2>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-black text-slate-900">Правильный ответ</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {currentQuestion.correctAnswer}
                        </p>
                      </div>

                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-black text-slate-900">
                          {isCorrect ? "Почему это верно" : "Почему так"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {currentQuestion.explanation}
                        </p>
                      </div>

                      {currentQuestion.rule ? (
                        <div className="rounded-3xl bg-blue-50 p-4">
                          <p className="text-sm font-black text-blue-700">Правило</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {currentQuestion.rule}
                          </p>
                        </div>
                      ) : null}

                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm font-black text-slate-900">Как рассуждать</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {buildReasoningHint(currentQuestion)}
                        </p>
                      </div>

                      {!isCorrect ? (
                        <div className="rounded-3xl bg-rose-50 p-4">
                          <p className="text-sm font-black text-rose-700">Типичная ловушка</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {buildTrapHint(currentQuestion)}
                          </p>
                        </div>
                      ) : null}

                      <div className="rounded-3xl bg-amber-50 p-4">
                        <p className="text-sm font-black text-amber-700">Что повторить</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {buildRepeatHint(currentQuestion)}
                        </p>
                      </div>

                      <div className="rounded-3xl bg-emerald-50 p-4">
                        <p className="text-sm font-black text-emerald-700">Что дальше</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {isCorrect
                            ? buildNextStepHint(true)
                            : "Ошибка уйдёт на повтор. Похожее задание вернётся позже, чтобы закрепить навык."}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                {isReviewSession ? "Разбор завершён" : "Сессия завершена"}
              </p>
              <h2 className="mt-2 text-4xl font-black leading-tight tracking-tight">
                {isReviewSession ? "Ошибки разобраны" : getSessionResultTitle(sessionCorrectCount)}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Короткий итог по заданиям: что закрепилось и что отправилось в повтор.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Верно</p>
                  <p className="mt-2 text-3xl font-black">{sessionCorrectCount}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Ошибки</p>
                  <p className="mt-2 text-3xl font-black">{sessionIncorrectCount}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Повтор</p>
                  <p className="mt-2 text-3xl font-black">{repeatCount}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Сессий</p>
                  <p className="mt-2 text-3xl font-black">
                    {sessionProgress?.sessionsCompleted ?? 1}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-black text-blue-700">Следующий шаг</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {getPreciseNextStep(sessionIncorrectCount, repeatFocusLabel)}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    clearSelectedTaskType();
                    setStoredReviewMode(subject, "session");
                    window.location.href = "/session";
                  }}
                  className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-black text-white"
                >
                  {isReviewSession ? "Разобрать ещё" : "Разобрать ошибки"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearSelectedTaskType();
                    clearStoredReviewMode();
                    window.location.href = "/session";
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  {isReviewSession ? "Обычная тренировка" : "Ещё тренировка"}
                </button>

                <Link
                  href="/mini-variant"
                  onClick={() => clearStoredReviewMode()}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  Мини-вариант
                </Link>

                <Link
                  href="/home"
                  onClick={() => clearStoredReviewMode()}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  На главную
                </Link>
              </div>

              <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-black text-slate-950">Хотите сохранить прогресс?</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Создайте кабинет или откройте Pro, чтобы продолжить план подготовки.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/register?source=session_complete"
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700"
                  >
                    Создать кабинет
                  </Link>
                  <Link
                    href="/paywall?plan=weekly&source=session_complete"
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    7 дней Pro — 199 ₽
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
