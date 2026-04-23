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

export type RepetitionState = {
  seenSessionQuestionIds?: SubjectQuestionMap;
  incorrectQuestionIds?: SubjectQuestionMap;
};

const STORAGE_KEYS = {
  studentProfile: "ege-trainer:student-profile",
  diagnosisResult: "ege-trainer:diagnosis-result",
  sessionProgress: "ege-trainer:session-progress",
  repetitionState: "ege-trainer:repetition-state",
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
