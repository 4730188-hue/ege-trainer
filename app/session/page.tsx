"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildSessionQuestions, getTaskTypeGuide, QUESTION_BANK, type BankQuestion } from "@/lib/questionBank";
import {
  addSeenSessionQuestionIds,
  clearQuestionIncorrect,
  clearSelectedTaskType,
  consumeFreeGateAccess,
  getDueReviewEntries,
  getFreeGateStatus,
  getIncorrectQuestionCount,
  getIncorrectQuestionIds,
  getPrioritizedIncorrectQuestionIds,
  getRepeatInsight,
  getReviewMode,
  getSelectedTaskType,
  getStudentProfile,
  getSubjectLabel,
  getSeenSessionQuestionIds,
  setReviewMode as setStoredReviewMode,
  clearReviewMode as clearStoredReviewMode,
  incrementSessionsCompleted,
  markQuestionIncorrect,
  normalizeSubjectKey,
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
  return `${question.skillLabel ?? question.topic}: повтори правило, реши похожее задание и проверь, почему остальные варианты не подходят.`;
}

function buildReasoningHint(question: BankQuestion) {
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
  if (question.taskType?.includes("орф") || question.topic.toLowerCase().includes("орф")) {
    return "Ловушка в том, что знакомое слово хочется выбрать по звучанию, а не по правилу написания.";
  }

  if (question.taskType?.includes("текст") || question.topic.toLowerCase().includes("текст")) {
    return "Ловушка в поверхностном чтении: ответ часто прячется не в отдельных словах, а в функции фрагмента или главной мысли.";
  }

  return "Типичная ловушка, отвечать слишком быстро и не проверить, какое именно правило здесь работает.";
}

function buildNextStepHint(isCorrect: boolean) {
  return isCorrect
    ? "Запомни ход решения и попробуй так же разобрать следующее задание без спешки."
    : "Это задание уйдёт на повтор, так что ты ещё вернёшься к нему и закрепишь решение спокойнее.";
}

function getNextRecommendedStep(errorsCount: number, repeatFocusLabel?: string | null) {
  if (errorsCount > 0) {
    return repeatFocusLabel
      ? `Сначала разобрать ошибки по фокусу ${repeatFocusLabel.toLowerCase()}.`
      : "Сначала разобрать ошибки и вернуть их в повтор.";
  }

  return "Можно идти дальше: ещё тренировка или мини-вариант ЕГЭ.";
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
    const gate = consumeFreeGateAccess("session");
    setGateStatus(gate);

    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    const selectedTask = getSelectedTaskType(nextSubject);
    const seenIds = getSeenSessionQuestionIds(nextSubject);
    const incorrectIds = getIncorrectQuestionIds(nextSubject);
    const isReviewMode = Boolean(getReviewMode(nextSubject));
    const dueReviewIds = getDueReviewEntries(nextSubject).map((entry) => entry.questionId);
    const prioritizedIncorrectIds = Array.from(new Set([...dueReviewIds, ...getPrioritizedIncorrectQuestionIds(nextSubject), ...incorrectIds]));

    const reviewQuestions = prioritizedIncorrectIds
      .map((questionId) => QUESTION_BANK.find((question) => question.subject === nextSubject && question.id === questionId))
      .filter((question): question is BankQuestion => Boolean(question))
      .slice(0, 15);

    const candidateQuestions = isReviewMode && reviewQuestions.length > 0
      ? reviewQuestions
      : buildSessionQuestions(nextSubject, {
          count: 15,
          seenIds,
          incorrectIds: prioritizedIncorrectIds,
          taskType: selectedTask?.taskType,
        });

    const nextQuestions = isReviewMode && reviewQuestions.length > 0
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
    setSelectedModeLabel(isReviewMode && reviewQuestions.length > 0 ? "Разбор ошибок" : selectedTask?.label ?? null);

    if (nextQuestions.length > 0 && !(isReviewMode && reviewQuestions.length > 0)) {
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
      <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
          <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-900 to-violet-700 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Free-лимит</p>
            <h1 className="mt-3 text-3xl font-black leading-tight">Сегодняшняя бесплатная тренировка уже использована</h1>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Pro открывает безлимитные сессии, интервальный повтор ошибок, тренировку по типам заданий и мини-варианты без паузы.
            </p>
          </section>
          <Link href="/paywall" className="primary-cta">
            <span className="block leading-none text-white">Открыть Pro и продолжить</span>
          </Link>
          <Link href="/home" className="secondary-cta">На главную</Link>
        </div>
      </main>
    );
  }

  if (!currentQuestion && !isFinished) {
    return (
      <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Подбираем задания</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Собираем 15 заданий из большого банка: слабые места, повтор ошибок и формат ЕГЭ.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (showLesson && !isFinished) {
    return (
      <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
          <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
            <span>Мини-урок перед практикой</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{subjectLabel}</span>
          </div>

          <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-900 to-violet-700 p-6 text-white shadow-[0_24px_60px_rgba(30,41,59,0.22)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
              {selectedModeLabel ? "Тренировка по типу задания" : "Тренировка по слабым местам"}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight">{guide?.title ?? repeatFocusLabel ?? "Рабочая сессия"}</h1>
            <p className="mt-3 text-sm leading-6 text-white/82">
              Перед задачами быстро вспоминаем правило. Это короткая учебная сессия: 15 заданий из большого банка по формату ЕГЭ.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Правило</p>
            <p className="mt-2 text-base leading-7 text-slate-800">{guide?.rule ?? "Сначала внимательно определи тип задания, затем выбери стратегию решения."}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Пример</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{guide?.example ?? "Смотри не только на ответ, но и на ход рассуждения."}</p>
            </div>
            <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-amber-800">
              <p className="text-sm font-semibold">Типичная ловушка</p>
              <p className="mt-2 text-sm leading-6">{guide?.trap ?? "Не отвечай на автомате: проверь условие и правило."}</p>
            </div>
          </section>

          <button type="button" onClick={() => setShowLesson(false)} className="primary-cta">
            <span className="block leading-none text-white">Начать 15 заданий</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-100/80 px-4 py-4 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>{isReviewSession ? "Разбор ошибок" : selectedModeLabel ? selectedModeLabel : "Учебная сессия"}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {isFinished ? "Готово" : isReviewSession ? `Ошибка ${currentIndex + 1} из ${questions.length}` : `${currentIndex + 1} из ${questions.length}`}
          </span>
        </div>

        {!isFinished ? (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{isReviewSession ? "Работаем с ошибками" : "Сессия на сегодня"}</p>
                <p className="text-sm text-slate-400">{subjectLabel}</p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {isReviewSession && currentIndex === 0 && !showResult && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Разбор ошибок</p>
                <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight">Разберём ошибки по одной</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  В этой сессии только вопросы из очереди повтора. Сначала отвечаешь, затем смотришь разбор и закрепляешь ход решения.
                </p>
              </section>
            )}

            <div className="flex flex-1 flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {getQuestionMeta(currentQuestion)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                  {currentQuestion.difficulty}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                {isReviewSession ? `Ошибка ${currentIndex + 1} из ${questions.length}` : `Задание ${currentIndex + 1} из ${questions.length}`} · типовая подготовка
              </p>

              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight">{currentQuestion.prompt}</h1>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const shouldHighlightCorrect = showResult && option === currentQuestion.correctAnswer;
                  const shouldHighlightWrong = showResult && isSelected && option !== currentQuestion.correctAnswer;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={showResult}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full rounded-3xl border px-4 py-4 text-left text-base transition ${
                        shouldHighlightCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : shouldHighlightWrong
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : isSelected
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
                <div
                  className={`mt-5 rounded-3xl border p-4 ${
                    isCorrect ? "border-emerald-100 bg-emerald-50" : "border-rose-100 bg-rose-50"
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                    {isCorrect ? "Сильный ход" : "Разбор ответа"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{feedbackLabel}</p>

                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">Правильный ответ</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-700">{currentQuestion.correctAnswer}</p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">{isCorrect ? "Почему это верно" : "Почему так"}</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{currentQuestion.explanation}</p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">Как рассуждать</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{buildReasoningHint(currentQuestion)}</p>
                    </div>

                    {!isCorrect && (
                      <div className="rounded-2xl bg-white/80 p-3">
                        <p className="text-sm font-semibold text-slate-900">Типичная ловушка</p>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600">{buildTrapHint(currentQuestion)}</p>
                      </div>
                    )}

                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">Что повторить</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">{buildRepeatHint(currentQuestion)}</p>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-3">
                      <p className="text-sm font-semibold text-slate-900">Что дальше</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {isCorrect
                          ? buildNextStepHint(true)
                          : "Ошибка уйдёт на повтор. Похожее задание вернётся позже, чтобы закрепить навык, а не просто увидеть правильный ответ."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="sticky bottom-4 mt-auto pt-5">
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={!selectedAnswer && !showResult}
                  className={`w-full rounded-full px-5 py-4 text-base font-semibold shadow-sm transition ${
                    selectedAnswer || showResult
                      ? "bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-600 text-white shadow-indigo-200/50"
                      : "bg-slate-200 text-slate-400"
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
            <p className="text-sm font-medium text-slate-500">{isReviewSession ? "Разбор завершён" : "Сессия завершена"}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">{isReviewSession ? "Ошибки разобраны" : "Отлично, тренировка засчитана"}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {isReviewSession
                ? "Короткий итог по вопросам из очереди ошибок: что закрепилось и что осталось на повторе."
                : "Короткий итог по 15 заданиям, чтобы сразу понять, что закрепилось и что отправилось в повтор."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Верно</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{sessionCorrectCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ошибки</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{sessionIncorrectCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ушло на повтор</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{sessionIncorrectCount}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Фокус</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{repeatFocusLabel ?? "Следующий навык"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Следующий рекомендуемый шаг</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {getNextRecommendedStep(sessionIncorrectCount, repeatFocusLabel)}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Сессий всего: {sessionProgress?.sessionsCompleted ?? 1}. Сейчас на повторе в системе: {repeatCount}.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  clearSelectedTaskType();
                  setStoredReviewMode(subject, "session");
                  window.location.href = "/session";
                }}
                className="primary-cta w-full"
              >
                <span className="block leading-none text-white">{isReviewSession ? "Разобрать ещё" : "Разобрать ошибки"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearSelectedTaskType();
                  clearStoredReviewMode();
                  window.location.href = "/session";
                }}
                className="secondary-cta w-full"
              >
                {isReviewSession ? "Обычная тренировка" : "Ещё тренировка"}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearStoredReviewMode();
                  window.location.href = "/mini-variant";
                }}
                className="secondary-cta w-full"
              >
                Мини-вариант ЕГЭ
              </button>

              <button
                type="button"
                onClick={() => {
                  clearStoredReviewMode();
                  window.location.href = "/home";
                }}
                className="secondary-cta w-full"
              >
                На главную
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
