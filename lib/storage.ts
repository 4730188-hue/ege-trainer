export type StudentProfile = {
  subject?: string;
  targetScore?: string;
  dailyMinutes?: string;
  examDateLabel?: string;
  examTimeline?: string;
};

const STORAGE_KEYS = {
  studentProfile: "ege-trainer:student-profile",
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
