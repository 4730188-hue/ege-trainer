export type StudentProfile = {
  subject?: string;
  targetScore?: string;
  dailyMinutes?: string;
  examDateLabel?: string;
  examTimeline?: string;
};

export type DiagnosisResult = {
  levelLabel?: string;
  weakTopics?: string[];
  completedDiagnosis?: boolean;
};

export type SessionProgress = {
  sessionsCompleted?: number;
  lastSessionCompletedAt?: string;
  streakDays?: number;
  lastActivityDate?: string;
};

const STORAGE_KEYS = {
  studentProfile: "ege-trainer:student-profile",
  diagnosisResult: "ege-trainer:diagnosis-result",
  sessionProgress: "ege-trainer:session-progress",
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
  if (subject === "russian") return "Русский язык";
  if (!subject) return null;
  return subject;
}

export function getExamTimelineLabel(examTimeline?: string | null) {
  if (examTimeline === "lt1") return "Меньше месяца";
  if (examTimeline === "1to3") return "1–3 месяца";
  if (examTimeline === "3to6") return "3–6 месяцев";
  if (examTimeline === "gt6") return "Больше 6 месяцев";
  if (!examTimeline) return null;
  return examTimeline;
}
