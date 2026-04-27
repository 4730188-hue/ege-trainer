import { QUESTION_BANK, type SubjectKey, type TaskType } from "@/lib/questionBank";

export type SubjectTaskTypeCountMap = Partial<Record<SubjectKey, Partial<Record<TaskType, number>>>>;

export type StudentProfile = {
  subject?: string;
  targetScore?: string;
  dailyMinutes?: string;
  examDateLabel?: string;
  examTimeline?: string;
};

export type DiagnosisResult = {
  subject?: SubjectKey;
  levelLabel?: string;
  weakTopics?: string[];
  completedDiagnosis?: boolean;
  correctAnswers?: number;
  totalQuestions?: number;
};

export type WeakTaskTypeEntry = {
  taskType: TaskType;
  label: string;
  count: number;
  isWeakness: boolean;
};

export type RepeatInsight = {
  repeatCount: number;
  weakTaskTypes: WeakTaskTypeEntry[];
  ordinaryErrorCount: number;
  persistentWeaknessCount: number;
  priorityTaskTypeLabel?: string;
};

export type SessionProgress = {
  sessionsCompleted?: number;
  lastSessionCompletedAt?: string;
  streakDays?: number;
  lastActivityDate?: string;
};

type SubjectQuestionMap = Partial<Record<SubjectKey, string[]>>;
type SubjectQuestionCountMap = Partial<Record<SubjectKey, Record<string, number>>>;
type SubjectIndexMap = Partial<Record<SubjectKey, number>>;
type SubjectVariantIdMap = Partial<Record<SubjectKey, string>>;

export type RepetitionState = {
  seenSessionQuestionIds?: SubjectQuestionMap;
  incorrectQuestionIds?: SubjectQuestionMap;
  questionErrorCounts?: SubjectQuestionCountMap;
  taskTypeErrorCounts?: SubjectTaskTypeCountMap;
};

export type MiniVariantResult = {
  subject?: SubjectKey;
  variantId?: string;
  variantNumber?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  completedAt?: string;
};

export type MiniVariantProgress = {
  completedCount?: number;
  lastResult?: MiniVariantResult | null;
  lastVariantIndexBySubject?: SubjectIndexMap;
  lastVariantIdBySubject?: SubjectVariantIdMap;
};

export type ProPlanKey = "monthly" | "quarterly";

export type ProSubscription = {
  isPro?: boolean;
  activePlan?: ProPlanKey;
  activatedAt?: string;
};

export type FreeGateFeatureKey = "session" | "miniVariant";

export type FreeGateFeatureState = {
  date?: string;
  count?: number;
  blocked?: boolean;
  inProgress?: boolean;
};

export type FreeGateState = Partial<Record<FreeGateFeatureKey, FreeGateFeatureState>>;


export type ReviewScheduleEntry = {
  questionId: string;
  subject: SubjectKey;
  taskType?: TaskType;
  mistakes: number;
  intervalDays: number;
  dueDate: string;
  lastAnsweredAt: string;
};

export type ReviewScheduleState = Partial<Record<SubjectKey, Record<string, ReviewScheduleEntry>>>;

export type ParentWeeklyReport = {
  title: string;
  summary: string;
  wins: string[];
  risks: string[];
  nextWeek: string[];
};

export type ReviewModeState = {
  subject?: SubjectKey;
  enabled?: boolean;
  source?: "session" | "progress" | "home";
};

export type FreeGateStatus = {
  isPro: boolean;
  isBlocked: boolean;
  count: number;
  limit: number;
  date: string;
  inProgress: boolean;
};

export type RoadmapInput = {
  subjectLabel: string;
  weakTopics?: string[];
  sessionsCompleted?: number;
  streakDays?: number;
  diagnosisCompleted?: boolean;
  repeatCount?: number;
  completedMiniVariants?: number;
};

export type RoadmapPlan = {
  homeStatus: string;
  homeSteps: string[];
  progressStage: "novice" | "in_progress" | "advanced";
  progressSummary: string;
  nextFocus: string;
};

export type ReadinessInput = {
  targetLabel: string;
  diagnosisCompleted?: boolean;
  sessionsCompleted?: number;
  streakDays?: number;
  weakTopics?: string[];
  repeatCount?: number;
  completedMiniVariants?: number;
  lastMiniCorrectAnswers?: number;
  lastMiniTotalQuestions?: number;
};

export type ReadinessPlan = {
  statusLabel: string;
  tone: "indigo" | "green" | "amber";
  closenessText: string;
  blockers: string[];
  nextFocus: string;
};

const STORAGE_KEYS = {
  studentProfile: "ege-trainer:student-profile",
  diagnosisResult: "ege-trainer:diagnosis-result",
  sessionProgress: "ege-trainer:session-progress",
  repetitionState: "ege-trainer:repetition-state",
  miniVariantProgress: "ege-trainer:mini-variant-progress",
  proSubscription: "ege-trainer:pro-subscription",
  freeGateState: "ege-trainer:free-gate-state",
  selectedTaskType: "ege-trainer:selected-task-type",
  reviewSchedule: "ege-trainer:review-schedule",
  lessonHistory: "ege-trainer:lesson-history",
  reviewMode: "ege-trainer:review-mode",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function safeRead<T>(key: string): T | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

function dedupe(items: string[]) {
  return Array.from(new Set(items));
}

function toTaskTypeLabel(taskType: TaskType) {
  return taskType.replaceAll("_", " ");
}
function getQuestionById(subject: SubjectKey, questionId: string) {
  return QUESTION_BANK.find((entry) => entry.id === questionId && entry.subject === subject) ?? null;
}

function getQuestionErrorCount(subject: SubjectKey, questionId: string) {
  const state = getRepetitionState();
  return state.questionErrorCounts?.[subject]?.[questionId] ?? 0;
}

function getTaskTypeErrorCount(subject: SubjectKey, taskType: TaskType) {
  const state = getRepetitionState();
  return state.taskTypeErrorCounts?.[subject]?.[taskType] ?? 0;
}

function isPersistentQuestionWeakness(subject: SubjectKey, questionId: string) {
  return getQuestionErrorCount(subject, questionId) >= 2;
}

function isPersistentTaskTypeWeakness(subject: SubjectKey, taskType: TaskType) {
  return getTaskTypeErrorCount(subject, taskType) >= 3;
}

function getPrioritizedIncorrectIds(subject: SubjectKey) {
  const ids = getIncorrectQuestionIds(subject);

  return [...ids].sort((leftId, rightId) => {
    const leftQuestion = getQuestionById(subject, leftId);
    const rightQuestion = getQuestionById(subject, rightId);

    const leftScore = (getQuestionErrorCount(subject, leftId) * 10) + (leftQuestion ? getTaskTypeErrorCount(subject, leftQuestion.taskType) : 0);
    const rightScore = (getQuestionErrorCount(subject, rightId) * 10) + (rightQuestion ? getTaskTypeErrorCount(subject, rightQuestion.taskType) : 0);

    return rightScore - leftScore;
  });
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayDiff(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.round(diffMs / 86400000);
}

const FREE_DAILY_LIMITS: Record<FreeGateFeatureKey, number> = {
  session: 1,
  miniVariant: 1,
};

function getFreeGateState() {
  return safeRead<FreeGateState>(STORAGE_KEYS.freeGateState) ?? {};
}

function saveFreeGateState(state: FreeGateState) {
  safeWrite(STORAGE_KEYS.freeGateState, state);
}

function getNormalizedFreeGateEntry(feature: FreeGateFeatureKey, today = getLocalDateString(new Date())) {
  const state = getFreeGateState();
  const entry = state[feature];

  if (!entry || entry.date !== today) {
    return {
      state,
      today,
      entry: {
        date: today,
        count: 0,
        blocked: false,
        inProgress: false,
      } satisfies FreeGateFeatureState,
    };
  }

  return {
    state,
    today,
    entry: {
      date: today,
      count: entry.count ?? 0,
      blocked: Boolean(entry.blocked),
      inProgress: Boolean(entry.inProgress),
    } satisfies FreeGateFeatureState,
  };
}

function persistFreeGateEntry(feature: FreeGateFeatureKey, nextEntry: FreeGateFeatureState) {
  const { state } = getNormalizedFreeGateEntry(feature, nextEntry.date ?? getLocalDateString(new Date()));

  saveFreeGateState({
    ...state,
    [feature]: nextEntry,
  });
}

export function getFreeGateStatus(feature: FreeGateFeatureKey): FreeGateStatus {
  const { today, entry } = getNormalizedFreeGateEntry(feature);
  const limit = FREE_DAILY_LIMITS[feature];
  const isPro = Boolean(getProSubscription().isPro);
  const count = entry.count ?? 0;
  const inProgress = Boolean(entry.inProgress);

  return {
    isPro,
    isBlocked: !isPro && count >= limit && !inProgress,
    count,
    limit,
    date: today,
    inProgress,
  };
}

export function consumeFreeGateAccess(feature: FreeGateFeatureKey) {
  const status = getFreeGateStatus(feature);

  if (status.isPro || status.inProgress) {
    return status;
  }

  if (status.isBlocked) {
    persistFreeGateEntry(feature, {
      date: status.date,
      count: status.count,
      blocked: true,
      inProgress: false,
    });
    return {
      ...status,
      isBlocked: true,
    };
  }

  const nextCount = status.count + 1;
  persistFreeGateEntry(feature, {
    date: status.date,
    count: nextCount,
    blocked: nextCount >= status.limit,
    inProgress: true,
  });

  return getFreeGateStatus(feature);
}

export function releaseFreeGateAccess(feature: FreeGateFeatureKey) {
  const status = getFreeGateStatus(feature);

  if (status.isPro) {
    return status;
  }

  persistFreeGateEntry(feature, {
    date: status.date,
    count: status.count,
    blocked: status.count >= status.limit,
    inProgress: false,
  });

  return getFreeGateStatus(feature);
}


export function getSelectedTaskType(subject?: SubjectKey) {
  const stored = safeRead<{ subject?: SubjectKey; taskType?: TaskType; label?: string }>(STORAGE_KEYS.selectedTaskType);
  if (!stored?.taskType) return null;
  if (subject && stored.subject && stored.subject !== subject) return null;
  return stored;
}

export function setSelectedTaskType(subject: SubjectKey, taskType: TaskType, label?: string) {
  const next = { subject, taskType, label: label ?? toTaskTypeLabel(taskType) };
  safeWrite(STORAGE_KEYS.selectedTaskType, next);
  return next;
}

export function clearSelectedTaskType() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.selectedTaskType);
  } catch {
    // noop
  }
}

export function getReviewMode(subject?: SubjectKey) {
  const stored = safeRead<ReviewModeState>(STORAGE_KEYS.reviewMode);
  if (!stored?.enabled) return null;
  if (subject && stored.subject && stored.subject !== subject) return null;
  return stored;
}

export function setReviewMode(subject: SubjectKey, source: ReviewModeState["source"] = "session") {
  const next: ReviewModeState = { subject, enabled: true, source };
  safeWrite(STORAGE_KEYS.reviewMode, next);
  return next;
}

export function clearReviewMode() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.reviewMode);
  } catch {
    // noop
  }
}

export function getReviewSchedule() {
  return safeRead<ReviewScheduleState>(STORAGE_KEYS.reviewSchedule) ?? {};
}

export function saveReviewSchedule(state: ReviewScheduleState) {
  safeWrite(STORAGE_KEYS.reviewSchedule, state);
}

export function getDueReviewEntries(subject: SubjectKey) {
  const today = getLocalDateString(new Date());
  const entries = Object.values(getReviewSchedule()[subject] ?? {});
  return entries
    .filter((entry) => entry.dueDate <= today)
    .sort((a, b) => b.mistakes - a.mistakes || a.dueDate.localeCompare(b.dueDate));
}

export function scheduleQuestionReview(subject: SubjectKey, questionId: string) {
  const question = getQuestionById(subject, questionId);
  const state = getReviewSchedule();
  const subjectSchedule = state[subject] ?? {};
  const previous = subjectSchedule[questionId];
  const mistakes = (previous?.mistakes ?? 0) + 1;
  const intervalDays = mistakes === 1 ? 1 : mistakes === 2 ? 2 : mistakes === 3 ? 5 : 10;
  const now = new Date();
  const due = new Date(now);
  due.setDate(now.getDate() + intervalDays);

  const nextEntry: ReviewScheduleEntry = {
    questionId,
    subject,
    taskType: question?.taskType,
    mistakes,
    intervalDays,
    dueDate: getLocalDateString(due),
    lastAnsweredAt: now.toISOString(),
  };

  saveReviewSchedule({
    ...state,
    [subject]: {
      ...subjectSchedule,
      [questionId]: nextEntry,
    },
  });

  return nextEntry;
}

export function completeQuestionReview(subject: SubjectKey, questionId: string) {
  const state = getReviewSchedule();
  const subjectSchedule = { ...(state[subject] ?? {}) };
  delete subjectSchedule[questionId];

  saveReviewSchedule({
    ...state,
    [subject]: subjectSchedule,
  });
}

export function getTaskTypeMastery(subject: SubjectKey) {
  const questions = QUESTION_BANK.filter((entry) => entry.subject === subject && entry.mode !== "diagnosis");
  const state = getRepetitionState();
  const errorCounts = state.taskTypeErrorCounts?.[subject] ?? {};
  const groups = new Map<TaskType, number>();

  questions.forEach((question) => {
    groups.set(question.taskType, (groups.get(question.taskType) ?? 0) + 1);
  });

  return Array.from(groups.entries())
    .map(([taskType, total]) => {
      const errors = Number(errorCounts[taskType] ?? 0);
      const score = Math.max(20, Math.min(100, Math.round(100 - (errors / Math.max(total, 1)) * 35)));
      return {
        taskType,
        label: toTaskTypeLabel(taskType),
        score,
        errors,
        status: score >= 80 ? "сильная зона" : score >= 55 ? "в работе" : "нужна опора",
      };
    })
    .sort((a, b) => a.score - b.score);
}

export function buildParentWeeklyReport(input: {
  subjectLabel: string;
  targetLabel: string;
  sessionsCompleted?: number;
  streakDays?: number;
  weakTopics?: string[];
  repeatCount?: number;
  weakTaskTypes?: WeakTaskTypeEntry[];
  completedMiniVariants?: number;
}): ParentWeeklyReport {
  const weakTask = input.weakTaskTypes?.[0]?.label;
  const sessions = input.sessionsCompleted ?? 0;
  const streak = input.streakDays ?? 0;
  const repeat = input.repeatCount ?? 0;
  const mini = input.completedMiniVariants ?? 0;

  const wins = [
    sessions > 0 ? `завершено тренировочных сессий: ${sessions}` : "стартовый маршрут готов к запуску",
    streak > 1 ? `держится серия занятий: ${streak} дня` : "можно быстро набрать регулярность короткими сессиями",
    mini > 0 ? `мини-вариантов пройдено: ${mini}` : "мини-вариант пока ждёт первой проверки устойчивости",
  ];

  const risks = [
    repeat > 0 ? `в очереди на повтор: ${repeat}` : "очередь ошибок пока не перегружена",
    weakTask ? `проседает тип задания: ${weakTask}` : input.weakTopics?.[0] ? `проседает тема: ${input.weakTopics[0]}` : "слабые зоны ещё уточняются",
  ];

  const nextWeek = [
    repeat > 0 ? "закрыть вопросы на повтор по расписанию" : "набрать 2–3 регулярные тренировки",
    weakTask ? `потренировать тип задания «${weakTask}»` : "выбрать конкретный тип задания и закрепить навык",
    "проверить устойчивость через мини-вариант ЕГЭ",
  ];

  return {
    title: `Отчёт для родителя: ${input.subjectLabel}`,
    summary: `Цель — ${input.targetLabel}. Видно, что подготовку лучше вести не тестами вразнобой, а циклом: навык → практика → повтор → мини-вариант.`,
    wins,
    risks,
    nextWeek,
  };
}

export function normalizeSubjectKey(subject?: string | null): SubjectKey {
  if (subject === "math" || subject === "math-profile" || subject === "profile-math") {
    return "math";
  }

  if (
    subject === "social" ||
    subject === "social-studies" ||
    subject === "socialscience" ||
    subject === "social-science"
  ) {
    return "social";
  }

  return "russian";
}

export function getStudentProfile() {
  return safeRead<StudentProfile>(STORAGE_KEYS.studentProfile);
}

export function saveStudentProfile(profile: StudentProfile) {
  safeWrite(STORAGE_KEYS.studentProfile, profile);
}

export function updateStudentSubject(subject: SubjectKey) {
  const current = getStudentProfile() ?? {};
  const next: StudentProfile = {
    ...current,
    subject,
  };

  saveStudentProfile(next);
  return next;
}

export function getDiagnosisResult() {
  return safeRead<DiagnosisResult>(STORAGE_KEYS.diagnosisResult);
}

export function saveDiagnosisResult(result: DiagnosisResult) {
  safeWrite(STORAGE_KEYS.diagnosisResult, result);
}

export function getSessionProgress() {
  return safeRead<SessionProgress>(STORAGE_KEYS.sessionProgress);
}

export function saveSessionProgress(progress: SessionProgress) {
  safeWrite(STORAGE_KEYS.sessionProgress, progress);
}

export function getRepetitionState() {
  return (
    safeRead<RepetitionState>(STORAGE_KEYS.repetitionState) ?? {
      seenSessionQuestionIds: {},
      incorrectQuestionIds: {},
      questionErrorCounts: {},
      taskTypeErrorCounts: {},
    }
  );
}

export function saveRepetitionState(state: RepetitionState) {
  safeWrite(STORAGE_KEYS.repetitionState, state);
}

export function getSeenSessionQuestionIds(subject: SubjectKey) {
  const state = getRepetitionState();
  return state.seenSessionQuestionIds?.[subject] ?? [];
}

export function addSeenSessionQuestionIds(subject: SubjectKey, ids: string[]) {
  const state = getRepetitionState();
  const current = state.seenSessionQuestionIds?.[subject] ?? [];

  saveRepetitionState({
    ...state,
    seenSessionQuestionIds: {
      ...state.seenSessionQuestionIds,
      [subject]: dedupe([...current, ...ids]),
    },
  });
}

export function getIncorrectQuestionIds(subject: SubjectKey) {
  const state = getRepetitionState();
  return state.incorrectQuestionIds?.[subject] ?? [];
}

export function getPrioritizedIncorrectQuestionIds(subject: SubjectKey) {
  return getPrioritizedIncorrectIds(subject);
}

export function markQuestionIncorrect(subject: SubjectKey, questionId: string) {
  const state = getRepetitionState();
  const current = state.incorrectQuestionIds?.[subject] ?? [];
  const currentQuestionCounts = state.questionErrorCounts?.[subject] ?? {};
  const question = getQuestionById(subject, questionId);
  const taskType = question?.taskType;
  const currentTaskTypeCounts = state.taskTypeErrorCounts?.[subject] ?? {};

  scheduleQuestionReview(subject, questionId);

  saveRepetitionState({
    ...state,
    incorrectQuestionIds: {
      ...state.incorrectQuestionIds,
      [subject]: dedupe([...current, questionId]),
    },
    questionErrorCounts: {
      ...state.questionErrorCounts,
      [subject]: {
        ...currentQuestionCounts,
        [questionId]: (currentQuestionCounts[questionId] ?? 0) + 1,
      },
    },
    taskTypeErrorCounts: taskType
      ? {
          ...state.taskTypeErrorCounts,
          [subject]: {
            ...currentTaskTypeCounts,
            [taskType]: (currentTaskTypeCounts[taskType] ?? 0) + 1,
          },
        }
      : state.taskTypeErrorCounts,
  });
}

export function clearQuestionIncorrect(subject: SubjectKey, questionId: string) {
  completeQuestionReview(subject, questionId);
  const state = getRepetitionState();
  const current = state.incorrectQuestionIds?.[subject] ?? [];

  saveRepetitionState({
    ...state,
    incorrectQuestionIds: {
      ...state.incorrectQuestionIds,
      [subject]: current.filter((id) => id !== questionId),
    },
  });
}

export function getIncorrectQuestionCount(subject: SubjectKey) {
  return getIncorrectQuestionIds(subject).length;
}

export function getWeakTaskTypes(subject: SubjectKey, limit = 3): WeakTaskTypeEntry[] {
  const incorrectIds = getIncorrectQuestionIds(subject);
  const state = getRepetitionState();
  const accumulatedTaskTypeCounts = state.taskTypeErrorCounts?.[subject] ?? {};
  const counts = new Map<TaskType, number>();

  incorrectIds.forEach((questionId) => {
    const question = getQuestionById(subject, questionId);
    if (!question) return;
    counts.set(question.taskType, (counts.get(question.taskType) ?? 0) + 1);
  });

  Object.entries(accumulatedTaskTypeCounts).forEach(([taskType, count]) => {
    counts.set(taskType as TaskType, Math.max(counts.get(taskType as TaskType) ?? 0, Number(count) || 0));
  });

  return Array.from(counts.entries())
    .sort((a, b) => {
      const diff = b[1] - a[1];
      if (diff !== 0) return diff;
      return Number(isPersistentTaskTypeWeakness(subject, b[0])) - Number(isPersistentTaskTypeWeakness(subject, a[0]));
    })
    .slice(0, limit)
    .map(([taskType, count]) => ({
      taskType,
      label: toTaskTypeLabel(taskType),
      count,
      isWeakness: isPersistentTaskTypeWeakness(subject, taskType),
    }));
}

export function getRepeatInsight(subject: SubjectKey): RepeatInsight {
  const incorrectIds = getIncorrectQuestionIds(subject);
  const weakTaskTypes = getWeakTaskTypes(subject, 3);

  let persistentWeaknessCount = 0;

  incorrectIds.forEach((questionId) => {
    const question = getQuestionById(subject, questionId);
    if (!question) return;
    if (isPersistentQuestionWeakness(subject, questionId) || isPersistentTaskTypeWeakness(subject, question.taskType)) {
      persistentWeaknessCount += 1;
    }
  });

  const ordinaryErrorCount = Math.max(incorrectIds.length - persistentWeaknessCount, 0);

  return {
    repeatCount: incorrectIds.length,
    weakTaskTypes,
    ordinaryErrorCount,
    persistentWeaknessCount,
    priorityTaskTypeLabel: weakTaskTypes[0]?.label,
  };
}

export function getMiniVariantProgress() {
  return (
    safeRead<MiniVariantProgress>(STORAGE_KEYS.miniVariantProgress) ?? {
      completedCount: 0,
      lastResult: null,
      lastVariantIndexBySubject: {},
      lastVariantIdBySubject: {},
    }
  );
}

export function saveMiniVariantProgress(progress: MiniVariantProgress) {
  safeWrite(STORAGE_KEYS.miniVariantProgress, progress);
}

export function getLastMiniVariantIndex(subject: SubjectKey) {
  return getMiniVariantProgress().lastVariantIndexBySubject?.[subject] ?? -1;
}

export function setLastMiniVariantSelection(subject: SubjectKey, index: number, variantId: string) {
  const current = getMiniVariantProgress();

  saveMiniVariantProgress({
    ...current,
    lastVariantIndexBySubject: {
      ...current.lastVariantIndexBySubject,
      [subject]: index,
    },
    lastVariantIdBySubject: {
      ...current.lastVariantIdBySubject,
      [subject]: variantId,
    },
  });
}

export function saveMiniVariantResult(result: MiniVariantResult) {
  const current = getMiniVariantProgress();

  saveMiniVariantProgress({
    ...current,
    completedCount: (current.completedCount ?? 0) + 1,
    lastResult: {
      ...result,
      completedAt: new Date().toISOString(),
    },
  });

  releaseFreeGateAccess("miniVariant");
}

export function getProSubscription() {
  return (
    safeRead<ProSubscription>(STORAGE_KEYS.proSubscription) ?? {
      isPro: false,
      activePlan: undefined,
      activatedAt: undefined,
    }
  );
}

export function saveProSubscription(subscription: ProSubscription) {
  safeWrite(STORAGE_KEYS.proSubscription, subscription);
}

export function activatePro(plan: ProPlanKey) {
  const next: ProSubscription = {
    isPro: true,
    activePlan: plan,
    activatedAt: new Date().toISOString(),
  };

  saveProSubscription(next);
  return next;
}

export function clearAppState() {
  if (!isBrowser()) return;

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch {
    // noop
  }
}

export function incrementSessionsCompleted() {
  const current = getSessionProgress() ?? {};
  const now = new Date();
  const today = getLocalDateString(now);
  const lastActivityDate = current.lastActivityDate;

  let streakDays = current.streakDays ?? 0;

  if (!lastActivityDate) {
    streakDays = 1;
  } else {
    const dayDiff = getDayDiff(lastActivityDate, today);

    if (dayDiff <= 0) {
      streakDays = Math.max(streakDays, 1);
    } else if (dayDiff === 1) {
      streakDays += 1;
    } else {
      streakDays = 1;
    }
  }

  const next: SessionProgress = {
    sessionsCompleted: (current.sessionsCompleted ?? 0) + 1,
    lastSessionCompletedAt: now.toISOString(),
    lastActivityDate: today,
    streakDays,
  };

  saveSessionProgress(next);
  releaseFreeGateAccess("session");
  return next;
}

export function getSubjectLabel(subject?: string | null) {
  const key = normalizeSubjectKey(subject);

  if (key === "math") return "Профильная математика";
  if (key === "social") return "Обществознание";
  return "Русский язык";
}

export function getProPlanLabel(plan?: ProPlanKey | null) {
  if (plan === "quarterly") return "3 месяца Pro";
  if (plan === "monthly") return "1 месяц Pro";
  return "Pro";
}

export function getExamTimelineLabel(examTimeline?: string | null) {
  if (examTimeline === "lt1") return "Меньше месяца";
  if (examTimeline === "1to3") return "1–3 месяца";
  if (examTimeline === "3to6") return "3–6 месяцев";
  if (examTimeline === "gt6") return "Больше 6 месяцев";
  if (!examTimeline) return null;
  return examTimeline;
}

export function buildReadiness(input: ReadinessInput): ReadinessPlan {
  const diagnosisCompleted = Boolean(input.diagnosisCompleted);
  const sessionsCompleted = input.sessionsCompleted ?? 0;
  const streakDays = input.streakDays ?? 0;
  const weakTopics = input.weakTopics ?? [];
  const repeatCount = input.repeatCount ?? 0;
  const completedMiniVariants = input.completedMiniVariants ?? 0;
  const lastMiniCorrectAnswers = input.lastMiniCorrectAnswers ?? 0;
  const lastMiniTotalQuestions = input.lastMiniTotalQuestions ?? 8;

  const blockers: string[] = [];

  if (!diagnosisCompleted) {
    blockers.push("ещё не собрана стартовая диагностика");
  }
  if (repeatCount > 0) {
    blockers.push(`в очереди остаётся ${repeatCount} вопрос${repeatCount === 1 ? "" : repeatCount < 5 ? "а" : "ов"} на повтор`);
  }
  if (weakTopics[0]) {
    blockers.push(`проседает тема ${weakTopics[0]}`);
  }
  if (sessionsCompleted < 3) {
    blockers.push("ещё мало практики в регулярных сессиях");
  }
  if (sessionsCompleted >= 3 && completedMiniVariants === 0) {
    blockers.push("ещё не проверена устойчивость через мини-вариант");
  }

  if (!diagnosisCompleted) {
    return {
      statusLabel: "Стартовая калибровка",
      tone: "amber",
      closenessText: `До цели ${input.targetLabel} сначала нужно собрать базовую картину по сильным и слабым темам.`,
      blockers: blockers.slice(0, 3),
      nextFocus: "Пройти диагностику и получить первую карту слабых тем.",
    };
  }

  if (repeatCount > 0 || weakTopics.length > 0) {
    return {
      statusLabel: "Есть узкие места",
      tone: "amber",
      closenessText: `До цели ${input.targetLabel} уже есть маршрут, но слабые темы пока заметно мешают стабильности.`,
      blockers: blockers.slice(0, 3),
      nextFocus: weakTopics[0]
        ? `Сначала выровнять тему ${weakTopics[0]} и разобрать повтор.`
        : "Сначала закрыть повтор и убрать ошибки из очереди.",
    };
  }

  if (
    sessionsCompleted >= 5 ||
    completedMiniVariants >= 2 ||
    streakDays >= 4 ||
    (lastMiniTotalQuestions > 0 && lastMiniCorrectAnswers / lastMiniTotalQuestions >= 0.75)
  ) {
    return {
      statusLabel: "Хорошая рабочая форма",
      tone: "green",
      closenessText: `Ты уже заметно ближе к цели ${input.targetLabel}. Сейчас важнее удержать темп и проверять устойчивость результата.`,
      blockers: blockers.slice(0, 2),
      nextFocus: completedMiniVariants > 0
        ? "Чередовать сессии и мини-варианты, чтобы закрепить стабильность."
        : "Добавить мини-вариант и посмотреть, как держится результат под нагрузкой.",
    };
  }

  return {
    statusLabel: "Фундамент собирается",
    tone: "indigo",
    closenessText: `К цели ${input.targetLabel} уже есть рабочее движение, но пока нужна ещё серия спокойных регулярных сессий.`,
    blockers: blockers.slice(0, 3),
    nextFocus: sessionsCompleted >= 3
      ? "Закрепить темп и перейти к первому мини-варианту."
      : "Набрать ещё несколько сессий и не ронять регулярность.",
  };
}

export function buildRoadmap(input: RoadmapInput): RoadmapPlan {
  const weakTopics = input.weakTopics ?? [];
  const sessionsCompleted = input.sessionsCompleted ?? 0;
  const streakDays = input.streakDays ?? 0;
  const diagnosisCompleted = Boolean(input.diagnosisCompleted);
  const repeatCount = input.repeatCount ?? 0;
  const completedMiniVariants = input.completedMiniVariants ?? 0;

  const steps: string[] = [];

  if (!diagnosisCompleted) {
    steps.push(`Пройди диагностику по предмету ${input.subjectLabel.toLowerCase()}`);
    if (sessionsCompleted === 0) {
      steps.push("Сделай 1 короткую сессию после диагностики");
    }
  }

  if (repeatCount > 0) {
    steps.push(
      weakTopics[0]
        ? `Повтори тему ${weakTopics[0]}`
        : `Разбери ${repeatCount} вопросов на повтор`,
    );
    steps.push(`Закрой ${repeatCount} вопрос${repeatCount === 1 ? "" : repeatCount < 5 ? "а" : "ов"} из повтора`);
  }

  if (diagnosisCompleted && sessionsCompleted === 0) {
    steps.push("Пройди 1 первую сессию");
  }

  if (diagnosisCompleted && sessionsCompleted > 0 && sessionsCompleted < 3) {
    steps.push("Сделай ещё 1 сессию сегодня");
  }

  if (sessionsCompleted >= 3) {
    steps.push("Попробуй мини-вариант ЕГЭ");
  }

  if (completedMiniVariants > 0) {
    steps.push("Сравни новый результат мини-варианта с прошлым");
  }

  if (streakDays > 0 && sessionsCompleted > 0) {
    steps.push(`Удержи streak, сейчас он ${streakDays} дн.`);
  }

  if (weakTopics.length > 1) {
    steps.push(`После этого вернись к теме ${weakTopics[1]}`);
  }

  const uniqueSteps = Array.from(new Set(steps)).slice(0, 4);

  let progressStage: RoadmapPlan["progressStage"] = "novice";
  if (diagnosisCompleted && (sessionsCompleted >= 4 || completedMiniVariants >= 2 || streakDays >= 4)) {
    progressStage = "advanced";
  } else if (diagnosisCompleted && sessionsCompleted >= 1) {
    progressStage = "in_progress";
  }

  let homeStatus = "Сначала пройди диагностику";
  if (repeatCount > 0) {
    homeStatus = weakTopics[0] ? `Есть вопросы на повтор по теме ${weakTopics[0]}` : "Есть вопросы на повтор";
  } else if (!diagnosisCompleted) {
    homeStatus = "Диагностика ещё не пройдена";
  } else if (sessionsCompleted === 0) {
    homeStatus = "Диагностика пройдена, пора в первую сессию";
  } else if (sessionsCompleted >= 3 && completedMiniVariants === 0) {
    homeStatus = "Готов попробовать мини-вариант";
  } else if (sessionsCompleted > 0) {
    homeStatus = "Сделай ещё 1 сессию сегодня";
  }

  let progressSummary = "Пока мало данных, сначала нужно собрать базовую картину.";
  if (progressStage === "in_progress") {
    progressSummary = `Ты уже в процессе: диагностика пройдена, сессий завершено ${sessionsCompleted}.`;
  }
  if (progressStage === "advanced") {
    progressSummary = `Ты уже продвинулся: сессий ${sessionsCompleted}, мини-вариантов ${completedMiniVariants}.`;
  }

  let nextFocus = !diagnosisCompleted
    ? "Сначала открыть диагностику и получить первую карту слабых тем."
    : weakTopics[0]
      ? `Следующий фокус, тема ${weakTopics[0]} и её стабильное повторение.`
      : "Следующий фокус, удерживать темп и постепенно усложнять практику.";

  if (repeatCount > 0) {
    nextFocus = `Следующий фокус, закрыть повтор и убрать ошибки из очереди, сейчас их ${repeatCount}.`;
  } else if (sessionsCompleted >= 3) {
    nextFocus = "Следующий фокус, проверить устойчивость результата через мини-вариант.";
  }

  return {
    homeStatus,
    homeSteps: uniqueSteps.length > 0 ? uniqueSteps : ["Сделай 1 короткую сессию"],
    progressStage,
    progressSummary,
    nextFocus,
  };
}
