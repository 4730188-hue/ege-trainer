"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveStudentProfile } from "@/lib/storage";

const subjectOptions = [
  { key: "russian", title: "Русский язык", note: "Текст, орфография, пунктуация" },
  { key: "math", title: "Профильная математика", note: "Формулы, логика, практика" },
  { key: "social", title: "Обществознание", note: "Термины, блоки, аргументация" },
] as const;

const scoreOptions = ["60", "70", "80", "90+"];
const dailyOptions = ["10", "15", "20", "30+"];
const examOptions = [
  { key: "lt1", title: "Меньше месяца", note: "Нужен быстрый и точный фокус" },
  { key: "1to3", title: "1–3 месяца", note: "Есть время на ощутимый рост" },
  { key: "3to6", title: "3–6 месяцев", note: "Можно выстроить стабильный темп" },
  { key: "gt6", title: "Больше 6 месяцев", note: "Спокойный фундамент и запас" },
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [examTime, setExamTime] = useState("");

  const progressWidth = step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%";

  const canGoNext =
    (step === 1 && subject !== "") ||
    (step === 2 && targetScore !== "") ||
    (step === 3 && dailyTime !== "") ||
    (step === 4 && examTime !== "");

  function handleNext() {
    if (!canGoNext) return;

    if (step < 4) {
      setStep(step + 1);
      return;
    }

    saveStudentProfile({
      subject,
      targetScore,
      dailyMinutes: dailyTime,
      examTimeline: examTime,
    });

    router.push("/diagnosis");
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  return (
    <main className="min-h-[100dvh] px-4 py-4 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-3">
        <div className="flex items-center justify-between rounded-full border border-white/65 bg-white/55 px-4 py-2 text-sm text-slate-500 shadow-[0_10px_30px_rgba(99,102,241,0.08)] backdrop-blur-xl">
          <span>Красивый старт</span>
          <span className="rounded-full bg-indigo-100/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            Шаг {step}/4
          </span>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="absolute inset-x-6 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.18),transparent_72%)]" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Онбординг</p>
              <p className="mt-1 text-sm text-slate-400">Собираем маршрут под тебя</p>
            </div>
            <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/70 px-3 py-2 text-right">
              <p className="text-xs font-medium text-indigo-600">Прогресс</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{step} из 4</p>
            </div>
          </div>

          <div className="relative mt-4 rounded-full bg-slate-100/90 p-1">
            <div
              className="h-2 rounded-full bg-[linear-gradient(90deg,#6366f1_0%,#7c3aed_100%)] shadow-[0_6px_18px_rgba(99,102,241,0.28)] transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="relative mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Предмет</p>
                <h1 className="mt-3 text-[2.2rem] font-black leading-[1.04] tracking-tight text-slate-950">
                  С чего начнём твой путь к баллам?
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Выбери предмет, и мы соберём красивый, понятный и реалистичный маршрут подготовки.
                </p>

                <div className="mt-5 space-y-3">
                  {subjectOptions.map((option) => {
                    const selected = subject === option.key;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSubject(option.key)}
                        className={`w-full rounded-[1.7rem] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-indigo-300 bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(124,58,237,0.16))] shadow-[0_18px_35px_rgba(99,102,241,0.18)]"
                            : "border-slate-200/80 bg-white/88 hover:border-indigo-100 hover:bg-indigo-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-slate-950">{option.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{option.note}</p>
                          </div>
                          <span className={`mt-0.5 h-6 w-6 rounded-full border ${selected ? "border-indigo-500 bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.16)]" : "border-slate-300 bg-white"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Цель</p>
                <h1 className="mt-3 text-[2.2rem] font-black leading-[1.04] tracking-tight text-slate-950">
                  Какой балл хочешь забрать у экзамена?
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Зафиксируем ориентир, чтобы дальше показывать не просто активность, а движение к цели.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {scoreOptions.map((score) => {
                    const selected = targetScore === score;

                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setTargetScore(score)}
                        className={`rounded-[1.7rem] border px-5 py-5 text-left transition ${
                          selected
                            ? "border-indigo-300 bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(79,70,229,0.2))] shadow-[0_16px_35px_rgba(99,102,241,0.18)]"
                            : "border-slate-200/80 bg-white/88 hover:border-indigo-100 hover:bg-indigo-50/40"
                        }`}
                      >
                        <p className="text-2xl font-black tracking-tight text-slate-950">{score}</p>
                        <p className="mt-1 text-sm text-slate-500">целевой балл</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Темп</p>
                <h1 className="mt-3 text-[2.2rem] font-black leading-[1.04] tracking-tight text-slate-950">
                  Сколько времени реально готов уделять каждый день?
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Лучше честный темп, который выдержишь долго, чем идеальный план на два дня.
                </p>

                <div className="mt-5 space-y-3">
                  {dailyOptions.map((time) => {
                    const selected = dailyTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setDailyTime(time)}
                        className={`w-full rounded-[1.7rem] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-indigo-300 bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(124,58,237,0.16))] shadow-[0_18px_35px_rgba(99,102,241,0.18)]"
                            : "border-slate-200/80 bg-white/88 hover:border-indigo-100 hover:bg-indigo-50/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-slate-950">{time} минут</p>
                            <p className="mt-1 text-sm text-slate-500">бережный, но ощутимый темп</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {selected ? "Выбрано" : "Доступно"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Срок</p>
                <h1 className="mt-3 text-[2.2rem] font-black leading-[1.04] tracking-tight text-slate-950">
                  Через сколько примерно экзамен?
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Это поможет выбрать ритм: где идти мягко, а где включать больше фокуса и плотности.
                </p>

                <div className="mt-5 space-y-3">
                  {examOptions.map((option) => {
                    const selected = examTime === option.key;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setExamTime(option.key)}
                        className={`w-full rounded-[1.7rem] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-indigo-300 bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(124,58,237,0.16))] shadow-[0_18px_35px_rgba(99,102,241,0.18)]"
                            : "border-slate-200/80 bg-white/88 hover:border-indigo-100 hover:bg-indigo-50/40"
                        }`}
                      >
                        <p className="text-base font-semibold text-slate-950">{option.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{option.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 mt-3 -mx-4 border-t border-white/65 bg-white/82 px-4 pt-3 pb-1 backdrop-blur-xl">
            <p className="mb-2 text-center text-xs font-medium text-slate-500">Ответ можно поменять до следующего шага</p>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                className={`primary-cta ${canGoNext ? "" : "is-disabled"}`}
              >
                <span className={`block leading-none ${canGoNext ? "text-white" : "text-slate-400"}`}>
                  {step === 4 ? "Перейти к диагностике" : "Продолжить"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleBack}
                className={`secondary-cta ${step === 1 ? "text-slate-300" : "text-slate-600 hover:bg-slate-50"}`}
              >
                Назад
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
