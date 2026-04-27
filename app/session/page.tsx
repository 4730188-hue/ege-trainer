"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildSessionQuestions, getTaskTypeGuide, type BankQuestion } from "@/lib/questionBank";
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
  getSelectedTaskType,
  getStudentProfile,
  getSubjectLabel,
  getSeenSessionQuestionIds,
  incrementSessionsCompleted,
  markQuestionIncorrect,
  normalizeSubjectKey,
  type FreeGateStatus,
  type SessionProgress,
} from "@/lib/storage";

const positiveFeedback = ["Супер ✨", "Отлично 🔥", "Точно 💫", "Сильный ход ✅", "Так держать 🚀"];
const gentleFeedback = ["Почти 👀", "Разберём 📘", "Бывает 🌿", "Спокойно, идём дальше ✍️", "Уже ближе 💡"];

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

  useEffect(() => {
    const gate = consumeFreeGateAccess("session");
    setGateStatus(gate);

    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    const selectedTask = getSelectedTaskType(nextSubject);
    const seenIds = getSeenSessionQuestionIds(nextSubject);
    const incorrectIds = getIncorrectQuestionIds(nextSubject);
    const dueReviewIds = getDueReviewEntries(nextSubject).map((entry) => entry.questionId);
    const prioritizedIncorrectIds = Array.from(new Set([...dueReviewIds, ...getPrioritizedIncorrectQuestionIds(nextSubject)]));
    const candidateQuestions = buildSessionQuestions(nextSubject, {
      count: 15,
      seenIds,
      incorrectIds: prioritizedIncorrectIds,
      taskType: selectedTask?.taskType,
    });
    const nextQuestions = [...candidateQuestions]
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
    setSelectedModeLabel(selectedTask?.label ?? null);

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
          <span>{selectedModeLabel ? `Навык: ${selectedModeLabel}` : "Учебная сессия"}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {isFinished ? "Готово" : `${currentIndex + 1} из ${questions.length}`}
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
                <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                  {currentQuestion.topic}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight">{currentQuestion.prompt}</h1>

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
            <p className="text-sm font-medium text-slate-500">Сессия завершена</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">Отлично, тренировка засчитана</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Теперь ошибки вернутся по расписанию: часть можно повторить сегодня, часть — позже, чтобы знание закрепилось.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Сессий всего</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{sessionProgress?.sessionsCompleted ?? 1}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">На повтор</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{repeatCount}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Link href="/session" onClick={() => clearSelectedTaskType()} className="primary-cta">
                <span className="block leading-none text-white">Ещё тренировка</span>
              </Link>
              <Link href="/mini-variant" className="secondary-cta">Мини-вариант ЕГЭ</Link>
              <Link href="/progress" className="secondary-cta">Посмотреть прогресс</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
