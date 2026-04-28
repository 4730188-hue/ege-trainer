"use client";

import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { href: "/home", label: "Главная", icon: "⌂" },
  { href: "/session", label: "Тренировка", icon: "◎" },
  { href: "/task-training", label: "Тип задания", icon: "✦" },
  { href: "/mini-variant", label: "Мини-вариант", icon: "□" },
  { href: "/progress", label: "Прогресс", icon: "↗" },
  { href: "/profile", label: "Профиль", icon: "○" },
  { href: "/paywall", label: "Pro", icon: "♕" },
];

type TopMenuProps = {
  title?: string;
  subtitle?: string;
  showExitToHome?: boolean;
};

const feedbackUrl = "https://t.me/ege_trainer_demo_bot?start=feedback";
const taskErrorUrl = "https://t.me/ege_trainer_demo_bot?start=task_error";

export default function TopMenu({ title = "ЕГЭ Тренажёр", subtitle, showExitToHome = false }: TopMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 -mx-4 border-b border-slate-200/70 bg-[#fbfaf7]/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4">
          <Link href="/home" className="min-w-0">
            <div className="text-[1.35rem] font-bold tracking-[-0.035em] text-slate-950">{title}</div>
            {subtitle && <div className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</div>}
          </Link>

          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() => setIsOpen(true)}
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm shadow-slate-200/50"
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col rounded-l-3xl border-l border-slate-200 bg-[#fbfaf7] p-4 shadow-[-24px_0_60px_rgba(15,23,42,0.14)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold tracking-[-0.035em] text-slate-950">Меню</div>
                <div className="text-xs text-slate-500">быстрый доступ</div>
              </div>
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl leading-none text-slate-700"
              >
                ×
              </button>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition ${
                    index === 0 ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-base text-slate-600">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}

              {showExitToHome && (
                <Link
                  href="/home"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-[15px] font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-100 bg-white text-base text-amber-700">
                    ↩
                  </span>
                  <span>Прервать и выйти</span>
                </Link>
              )}

              <a
                href={feedbackUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-base text-slate-600">
                  ?
                </span>
                <span>Обратная связь</span>
              </a>

              <a
                href={taskErrorUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium text-slate-700 transition hover:bg-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-base text-slate-600">
                  !
                </span>
                <span>Сообщить об ошибке</span>
              </a>
            </nav>

          </aside>
        </div>
      )}
    </>
  );
}
