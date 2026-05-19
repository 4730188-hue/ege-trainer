"use client";

import { trackClientEvent } from "@/lib/clientAnalytics";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function getScoreLabel(score: number) {
  if (score >= 80) return "хорошо";
  if (score >= 60) return "нужно закрепить";
  return "стоит повторить";
}

export default function TaskTrainingPage() {
  const [subject, setSubject] = useState<SubjectKey>("russian");
  const [selected, setSelected] = useState<TaskType | null>(null);
  const [mastery, setMastery] = useState<ReturnType<typeof getTaskTypeMastery>>([]);
  const [repeatCount, setRepeatCount] = useState(0);

  useEffect(() => {
    trackClientEvent("task_training_open");

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
      const score = stats?.score ?? 70;

      return {
        taskType,
        title: guide?.title ?? taskType.replaceAll("_", " "),
        description:
          "Короткая тренировка по типовым заданиям. Сначала правило, затем задания и разбор ошибок.",
        score,
      };
    });
  }, [subject, mastery]);

  const selectedGuide = selected ? getTaskTypeGuide(selected) : null;
  const selectedTitle =
    selectedGuide?.title ?? selected?.replaceAll("_", " ") ?? "выберите тему";

  const chooseTaskType = (taskType: TaskType) => {
    const guide = getTaskTypeGuide(taskType);

    setSelected(taskType);
    setSelectedTaskType(subject, taskType, guide?.title ?? taskType.replaceAll("_", " "));

    trackClientEvent("task_type_select", {
      subject,
      taskType,
      title: guide?.title ?? taskType,
    });
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <section className="bg-[#050816] px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-6xl">
          <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
            <Link href="/" className="flex items-center gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-black leading-none text-white">
                ЕГЭ
              </span>
              <span className="text-lg font-black">Plan</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/home"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white"
              >
                Тренажёр
              </Link>
              <Link
                href="/account"
                className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white sm:block"
              >
                Кабинет
              </Link>
            </div>
          </header>

          <div className="mt-10 grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-300">
                Точечная тренировка
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Выберите тему, которую нужно подтянуть
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Предмет: {subjectLabel}. Перед заданиями будет короткое объяснение:
                правило, пример и типичная ошибка.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-slate-400">На повторе</p>
              <p className="mt-1 text-4xl font-black">{repeatCount}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Ошибки возвращаются в тренировку, чтобы тема закрепилась.
              </p>

              {repeatCount > 0 ? (
                <Link
                  href="/session"
                  className="mt-4 block rounded-2xl bg-amber-400 px-4 py-3 text-center text-sm font-black text-slate-950"
                >
                  Разобрать ошибки
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                  Темы
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Что тренируем сегодня
                </h2>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                {items.length} тем
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {items.map((item) => {
                const active = selected === item.taskType;

                return (
                  <button
                    key={item.taskType}
                    type="button"
                    onClick={() => chooseTaskType(item.taskType)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      active
                        ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black">{item.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-black">{item.score}%</p>
                        <p className="text-xs font-bold text-slate-500">
                          {getScoreLabel(item.score)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Выбрано
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {selectedTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selected
                  ? "Начните тренировку по выбранной теме. Сервис покажет задания и сохранит ошибки на повтор."
                  : "Выберите тему слева, чтобы начать точечную тренировку."}
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/session"
                  className={`rounded-2xl px-5 py-4 text-center text-lg font-black shadow-xl ${
                    selected
                      ? "bg-blue-600 text-white shadow-blue-600/20"
                      : "pointer-events-none bg-slate-200 text-slate-400 shadow-none"
                  }`}
                >
                  Начать тренировку
                </Link>

                <Link
                  href="/home"
                  className="rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center font-black text-blue-700"
                >
                  Вернуться к плану
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Как проходит тренировка
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">1. Короткое объяснение</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Правило, пример и типичная ошибка.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">2. Задания по теме</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Ответ сразу проверяется, а решение показывается после попытки.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">3. Повтор ошибок</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Сложные задания вернутся позже, чтобы тема закрепилась.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Ещё варианты
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/mini-variant"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  Пройти мини-вариант
                </Link>

                <Link
                  href="/progress"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-800"
                >
                  Посмотреть прогресс
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
