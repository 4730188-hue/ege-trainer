"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopMenu from "@/app/components/TopMenu";
import {
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

  useEffect(() => {
    const profile = getStudentProfile();
    const nextSubject = normalizeSubjectKey(profile?.subject);
    setSubject(nextSubject);
    setSelected(getSelectedTaskType(nextSubject)?.taskType ?? null);
    setMastery(getTaskTypeMastery(nextSubject));
    setRepeatCount(getRepeatInsight(nextSubject).repeatCount);
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
        score: stats?.score ?? 70,
      };
    });
  }, [subject, mastery]);

  const chooseTaskType = (taskType: TaskType) => {
    const guide = getTaskTypeGuide(taskType);
    setSelected(taskType);
    setSelectedTaskType(subject, taskType, guide?.title ?? taskType.replaceAll("_", " "));
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle={`${subjectLabel} · тип задания`} />

      <div className="mx-auto w-full max-w-md space-y-8 pt-7">
        <section>
          <p className="text-sm text-slate-500">точечная практика</p>
          <h1 className="mt-2 text-[2.35rem] font-black leading-[1.04] tracking-[-0.055em]">Выбери навык</h1>
          <p className="mt-4 text-lg leading-7 text-slate-500">Перед задачами будет короткий мини-урок: правило, пример и ловушка.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">На повторе</div>
              <div className="mt-1 text-3xl font-black">{repeatCount}</div>
            </div>
            <Link href="/session" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Слабые места</Link>
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
                className={`flex w-full items-center justify-between rounded-[1.5rem] border px-5 py-4 text-left transition ${
                  active ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-900"
                }`}
              >
                <span className="text-lg font-semibold">{item.title}</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">{item.score}%</span>
              </button>
            );
          })}
        </section>

        <div className="sticky bottom-4 z-20 rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur">
          <Link
            href="/session"
            className={`block rounded-2xl px-4 py-4 text-center font-semibold ${selected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}
          >
            {selected ? "Начать тренировку" : "Сначала выбери навык"}
          </Link>
        </div>
      </div>
    </main>
  );
}
