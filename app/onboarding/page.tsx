"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveStudentProfile } from "@/lib/storage";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [examTime, setExamTime] = useState("");

  const progressWidth =
    step === 1 ? "25%" : step === 2 ? "50%" : step === 3 ? "75%" : "100%";

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
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/40 backdrop-blur">
          <span>Стартовая настройка</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Шаг {step}/4
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Онбординг</p>
            <p className="text-sm text-slate-400">Подготовка</p>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: progressWidth }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">Шаг {step} из 4</p>

          {step === 1 && (
            <div className="mt-6">
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium text-slate-500">
                  Настройка подготовки
                </p>
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Какой предмет сдаёшь?
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Начнём с выбора предмета, чтобы собрать для тебя правильный маршрут.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSubject("russian")}
                  className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-semibold transition ${
                    subject === "russian"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  Русский язык
                </button>

                <button
                  type="button"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-semibold text-slate-400"
                >
                  Профильная математика · скоро
                </button>

                <button
                  type="button"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-semibold text-slate-400"
                >
                  Обществознание · скоро
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium text-slate-500">Цель по баллам</p>
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Какой балл хочешь получить?
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Выбери ориентир. Потом мы будем показывать прогресс по пути к нему.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["60", "70", "80", "90+"].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setTargetScore(score)}
                    className={`rounded-3xl border px-5 py-5 text-center text-lg font-semibold transition ${
                      targetScore === score
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                        : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6">
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium text-slate-500">Ежедневный темп</p>
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Сколько минут в день готов заниматься?
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Мы подстроим план так, чтобы он был реалистичным и не перегружал.
                </p>
              </div>

              <div className="space-y-3">
                {["10", "15", "20", "30+"].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setDailyTime(time)}
                    className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-semibold transition ${
                      dailyTime === time
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                        : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  >
                    {time} минут
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-6">
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium text-slate-500">Срок подготовки</p>
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Через сколько примерно экзамен?
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Это нужно, чтобы выбрать темп и порядок тем в диагностике.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setExamTime("lt1")}
                  className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-semibold transition ${
                    examTime === "lt1"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  Меньше месяца
                </button>

                <button
                  type="button"
                  onClick={() => setExamTime("1to3")}
                  className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-semibold transition ${
                    examTime === "1to3"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  1–3 месяца
                </button>

                <button
                  type="button"
                  onClick={() => setExamTime("3to6")}
                  className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-semibold transition ${
                    examTime === "3to6"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  3–6 месяцев
                </button>

                <button
                  type="button"
                  onClick={() => setExamTime("gt6")}
                  className={`w-full rounded-3xl border px-5 py-4 text-left text-base font-semibold transition ${
                    examTime === "gt6"
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-300/40"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                >
                  Больше 6 месяцев
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 pt-2">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className={`w-full rounded-3xl px-5 py-4 text-base font-semibold transition ${
              canGoNext
                ? "bg-slate-900 text-white shadow-sm shadow-slate-300/40 hover:opacity-95"
                : "bg-slate-200 text-slate-400"
            }`}
          >
            {step === 4 ? "Завершить" : "Далее"}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className={`w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-base font-medium transition ${
              step === 1 ? "text-slate-300" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Назад
          </button>
        </div>
      </div>
    </main>
  );
}
