"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getQuestionsBySubject,
  type BankQuestion,
  type SubjectKey,
  type TaskType,
} from "@/lib/questionBank";
import {
  getRepeatInsight,
  getStudentProfile,
  getSubjectLabel,
  getWeakTaskTypes,
  normalizeSubjectKey,
  type WeakTaskTypeEntry,
} from "@/lib/storage";

function formatTaskType(value: TaskType | string) {
  return String(value).replaceAll("_", " ");
}

function groupByTaskType(questions: BankQuestion[]) {
  return questions.reduce<Record<string, BankQuestion[]>>((acc, question) => {
    const key = question.taskType;
    acc[key] = acc[key] ?? [];
    acc[key].push(question);
    return acc;
  }, {});
}

function getTaskTypeHint(taskType: string) {
  if (taskType.includes("пунктуац")) return "Запятые, двоеточие, тире и конструкции, где чаще всего теряются баллы.";
  if (taskType.includes("лекс")) return "Смысл слов, паронимы, речевые ошибки и точность формулировки.";
  if (taskType.includes("текст")) return "Понимание смысла, связи предложений и авторской позиции.";
  if (taskType.includes("уравн")) return "Уравнения и неравенства: короткая практика на технику решения.";
  if (taskType.includes("функц")) return "Формулы, графики, значения функций и базовая аналитика.";
  if (taskType.includes("геометр")) return "Планиметрия и стереометрия: формулы, фигуры и внимательность к условию.";
  if (taskType.includes("вероят")) return "Вероятность и подсчёт исходов без лишней сложности.";
  if (taskType.includes("эконом")) return "Рынок, деньги, налоги, спрос, предложение и семейный бюджет.";
  if (taskType.includes("прав")) return "Право, ответственность, органы власти и жизненные ситуации.";
  if (taskType.includes("полит")) return "Государство, выборы, партии и ветви власти.";
  if (taskType.includes("социолог")) return "Социальные роли, группы, мобильность и конфликты.";
  return "Точечная тренировка по одному типу заданий, чтобы убрать конкретный пробел.";
}

export default function TaskTrainingPage() {
  const [subject, setSubject] = useState<SubjectKey>("russian");
  const [weakTypes, setWeakTypes] = useState<WeakTaskTypeEntry[]>([]);
  const [priorityLabel, setPriorityLabel] = useState<string | null>(null);

  useEffect(() => {
    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    setSubject(nextSubject);
    setWeakTypes(getWeakTaskTypes(nextSubject));
    setPriorityLabel(getRepeatInsight(nextSubject).priorityTaskTypeLabel ?? null);
  }, []);

  const questions = useMemo(() => getQuestionsBySubject(subject, "session"), [subject]);
  const grouped = useMemo(() => groupByTaskType(questions), [questions]);

  const taskTypes = useMemo(
    () =>
      Object.entries(grouped)
        .map(([taskType, items]) => ({
          taskType,
          label: formatTaskType(taskType),
          count: items.length,
          isWeak: weakTypes.some((entry) => entry.taskType === taskType),
        }))
        .sort((left, right) => {
          if (left.isWeak !== right.isWeak) return left.isWeak ? -1 : 1;
          return right.count - left.count;
        }),
    [grouped, weakTypes],
  );

  function startTaskTraining(taskType: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ege-trainer:selected-task-type", taskType);
      window.location.href = "/session";
    }
  }

  return (
    <main className="min-h-[100dvh] px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/60 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>Тип задания</span>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {getSubjectLabel(subject)}
          </span>
        </div>

        <section className="rounded-[2rem] border border-indigo-100/80 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.24),transparent_34%),linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)] p-5 text-white shadow-[0_30px_80px_rgba(49,46,129,0.26)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-100/75">Точечная прокачка</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight">
            Выбери навык и тренируй его отдельно
          </h1>
          <p className="mt-3 text-sm leading-6 text-indigo-100/85">
            Это режим для роста: меньше хаоса, больше повторения конкретного типа заданий.
          </p>
          {priorityLabel && (
            <div className="mt-4 rounded-2xl bg-white/12 px-4 py-3 text-sm font-medium text-white/90">
              Рекомендуемый фокус сейчас: {priorityLabel}
            </div>
          )}
        </section>

        <section className="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500">Доступные типы</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Что тренируем?
            </h2>
          </div>

          <div className="space-y-3">
            {taskTypes.map((item) => (
              <button
                key={item.taskType}
                type="button"
                onClick={() => startTaskTraining(item.taskType)}
                className={`w-full rounded-[1.55rem] border p-4 text-left transition ${
                  item.isWeak
                    ? "border-amber-200 bg-amber-50/90 shadow-[0_14px_35px_rgba(245,158,11,0.12)]"
                    : "border-slate-200 bg-slate-50/90 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-950">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {getTaskTypeHint(item.taskType)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    item.isWeak ? "bg-amber-100 text-amber-700" : "bg-white text-slate-700 ring-1 ring-slate-200"
                  }`}>
                    {item.isWeak ? "фокус" : `${item.count} задач`}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {taskTypes.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Пока нет задач для выбранного предмета. Вернись на главную и выбери другой предмет.
            </div>
          )}
        </section>

        <section className="rounded-[1.8rem] border border-indigo-100 bg-indigo-50/80 p-5 shadow-sm shadow-indigo-100/60">
          <p className="text-sm font-semibold text-indigo-700">Как это помогает</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Обычная тренировка ведёт по слабым местам автоматически. Этот режим нужен, когда хочешь добить конкретный навык: например, пунктуацию, уравнения или право.
          </p>
        </section>

        <nav className="bottom-nav mt-auto">
          <div className="bottom-nav-grid">
            <Link href="/home" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Главная</span>
            </Link>
            <Link href="/progress" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Прогресс</span>
            </Link>
            <Link href="/profile" className="bottom-nav-link whitespace-nowrap">
              <span className="block leading-none">Профиль</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
