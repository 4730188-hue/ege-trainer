import type { SubjectKey } from "@/lib/questionBank";

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

export type SessionProgress = {
  sessionsCompleted?: number;
  lastSessionCompletedAt?: string;
  streakDays?: number;
  lastActivityDate?: string;
};

type SubjectQuestionMap = Partial<Record<SubjectKey, string[]>>;
type SubjectIndexMap = Partial<Record<SubjectKey, number>>;
type SubjectVariantIdMap = Partial<Record<SubjectKey, string>>;

export type RepetitionState = {
  seenSessionQuestionIds?: SubjectQuestionMap;
  incorrectQuestionIds?: SubjectQuestionMap;
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

const STORAGE_KEYS = {
  studentProfile: "ege-trainer:student-profile",
  diagnosisResult: "ege-trainer:diagnosis-result",
  sessionProgress: "ege-trainer:session-progress",
  repetitionState: "ege-trainer:repetition-state",
  miniVariantProgress: "ege-trainer:mini-variant-progress",
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

export function markQuestionIncorrect(subject: SubjectKey, questionId: string) {
  const state = getRepetitionState();
  const current = state.incorrectQuestionIds?.[subject] ?? [];

  saveRepetitionState({
    ...state,
    incorrectQuestionIds: {
      ...state.incorrectQuestionIds,
      [subject]: dedupe([...current, questionId]),
    },
  });
}

export function clearQuestionIncorrect(subject: SubjectKey, questionId: string) {
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
  return next;
}

export function getSubjectLabel(subject?: string | null) {
  const key = normalizeSubjectKey(subject);

  if (key === "math") return "Профильная математика";
  if (key === "social") return "Обществознание";
  return "Русский язык";
}

export function getExamTimelineLabel(examTimeline?: string | null) {
  if (examTimeline === "lt1") return "Меньше месяца";
  if (examTimeline === "1to3") return "1–3 месяца";
  if (examTimeline === "3to6") return "3–6 месяцев";
  if (examTimeline === "gt6") return "Больше 6 месяцев";
  if (!examTimeline) return null;
  return examTimeline;
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
