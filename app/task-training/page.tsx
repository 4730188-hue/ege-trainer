"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getDueReviewEntries,
  getRepeatInsight,
  getSelectedTaskType,
  getStudentProfile,
  getSubjectLabel,
  getTaskTypeMastery,
  normalizeSubjectKey,
  setSelectedTaskType,
} from "@/lib/storage";
import { getTaskTypeGuide, type SubjectKey, type TaskType } from "@/lib/questionBank";

const subjectTaskTypes: Record<SubjectKey, TaskType[]> = {
  russian: ["пунктуация", "орфография", "грамматика", "лексика", "текст", "орфоэпия"],
  math: ["уравнения", "функции", "геометрия", "вероятность", "текстовая_задача", "вычисления", "прогрессия", "производная"],
  social: ["экономика", "право", "политика", "социология", "человек_и_общество", "духовная_сфера"],
};

export default function TaskTrainingPage() {
  const [subject, setSubject] = useState<SubjectKey>("russian");
  const [selected, setSelected] = useState<TaskType | null>(null);
  const [mastery, setMastery] = useState<ReturnType<typeof getTaskTypeMastery>>([]);
  const [repeatCount, setRepeatCount] = useState(0);
  const [dueReviews, setDueReviews] = useState(0);

  useEffect(() => {
    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    setSubject(nextSubject);
    setSelected(getSelectedTaskType(nextSubject)?.taskType ?? null);
    setMastery(getTaskTypeMastery(nextSubject));
    setRepeatCount(getRepeatInsight(nextSubject).repeatCount);
    setDueReviews(getDueReviewEntries(nextSubject).length);
  }, []);

  const subjectLabel = getSubjectLabel(subject);
  const items = useMemo(() => {
    const byTask = new Map(mastery.map((item) => [item.taskType, item]));
    return subjectTaskTypes[subject].map((taskType) => {
      const guide = getTaskTypeGuide(taskType);
      const stats = byTask.get(taskType);
      return {
        taskType,
        title: guide?.title ?? taskType.replaceAll("_", " "),
        rule: guide?.rule ?? "Сначала разберём короткое правило, затем закрепим его задачами.",
        trap: guide?.trap ?? "Главная ошибка — решать наугад без проверки правила.",
        score: stats?.score ?? 70,
        errors: stats?.errors ?? 0,
      };
    });
  }, [subject, mastery]);

  const chooseTaskType = (taskType: TaskType) => {
    const guide = getTaskTypeGuide(taskType);
    setSelected(taskType);
    setSelectedTaskType(subject, taskType, guide?.title ?? taskType.replaceAll("_", " "));
  };

  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 pb-24">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Тренировка по типу задания</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{subjectLabel}</span>
        </div>

        <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-900 to-violet-700 p-5 text-white shadow-[0_24px_60px_rgba(30,41,59,0.22)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Точечный режим</p>
          <h1 className="mt-3 text-3xl font-black leading-tight">Выбери навык, который хочешь прокачать</h1>
          <p className="mt-3 text-sm leading-6 text-white/82">
            Каждый режим начинается с короткого мини-урока: правило, пример, типичная ловушка. Потом — 9 заданий именно по выбранному типу.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/14 p-3">
              <p className="text-white/70">На повтор</p>
              <p className="mt-1 text-2xl font-black">{repeatCount}</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-3">
              <p className="text-white/70">Пора вернуть</p>
              <p className="mt-1 text-2xl font-black">{dueReviews}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {items.map((item) => {
            const active = selected === item.taskType;
            return (
              <button
                key={item.taskType}
                type="button"
                onClick={() => chooseTaskType(item.taskType)}
                className={`w-full rounded-[28px] border p-4 text-left transition ${
                  active
                    ? "border-indigo-300 bg-indigo-50 shadow-[0_16px_35px_rgba(79,70,229,0.12)]"
                    : "border-slate-200 bg-white shadow-sm shadow-slate-200/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Навык</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.rule}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {item.score}%
                  </span>
                </div>
                <p className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-sm leading-6 text-slate-500">
                  Ловушка: {item.trap}
                </p>
              </button>
            );
          })}
        </section>

        <div className="sticky bottom-4 z-20 rounded-[28px] border border-slate-200 bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur">
          <Link
            href="/session"
            className={`block rounded-[22px] px-4 py-4 text-center text-base font-bold ${
              selected ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white" : "bg-slate-200 text-slate-500"
            }`}
          >
            {selected ? "Начать тренировку по выбранному типу" : "Выбери тип задания"}
          </Link>
          <Link href="/home" className="mt-2 block rounded-[20px] px-4 py-3 text-center text-sm font-semibold text-slate-500">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
}
