import Link from "next/link";

const proofPoints = [
  { value: "15", label: "заданий в тренировке" },
  { value: "20", label: "в мини-варианте" },
  { value: "ЕГЭ", label: "формат и типы" },
];

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] bg-[#fbfaf7] px-4 py-5 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-md flex-col gap-5">
        <header className="flex items-center justify-between rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
          <span className="font-medium text-slate-700">EGE Trainer</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Mini App
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center">
          <div className="rounded-[2.2rem] border border-slate-200 bg-white p-7 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              подготовка без хаоса
            </p>
            <h1 className="mt-4 text-[2.7rem] font-black leading-[1.02] tracking-[-0.06em] text-slate-950">
              Подготовка к ЕГЭ по плану
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-500">
              Тренировки по предметам, проверка, решения и повтор ошибок.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-2">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
                  <p className="text-xl font-black text-slate-950">{point.value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">{point.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 space-y-3">
              <Link href="/onboarding" className="block rounded-2xl bg-blue-600 px-5 py-4 text-center text-base font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,0.22)]">
                Начать подготовку
              </Link>
              <Link href="/home" className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-base font-semibold text-slate-950">
                Открыть кабинет
              </Link>
            </div>
          </div>

          <section className="mt-4 rounded-[1.7rem] border border-blue-100 bg-blue-50/70 p-5">
            <div className="text-sm font-semibold text-blue-800">Pro — когда нужен полный режим</div>
            <p className="mt-1 text-sm leading-6 text-blue-700/80">
              Безлимитные тренировки, мини-варианты на 20 заданий и расширенный разбор прогресса для ученика и родителя.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
