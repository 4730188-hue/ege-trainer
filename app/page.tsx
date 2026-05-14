import Link from "next/link";

const features = [
  {
    title: "Диагностика по 3 предметам",
    text: "Русский, математика и обществознание. Короткая проверка показывает, какие темы стоит повторить в первую очередь.",
    icon: "🎯",
  },
  {
    title: "План на неделю",
    text: "После диагностики ребёнок получает понятный план: что тренировать сегодня, завтра и дальше.",
    icon: "📅",
  },
  {
    title: "Короткие тренировки",
    text: "Занятия по 10–15 минут помогают заниматься регулярно и не перегружаться.",
    icon: "🧠",
  },
  {
    title: "Повтор ошибок",
    text: "Ошибки не теряются. Сервис возвращает их в тренировку, чтобы тема закрепилась.",
    icon: "🔁",
  },
  {
    title: "Мини-варианты",
    text: "Можно проверять себя на коротких вариантах и постепенно привыкать к формату ЕГЭ.",
    icon: "📝",
  },
  {
    title: "Личный кабинет",
    text: "Результат, прогресс и доступ сохраняются в кабинете. Можно заниматься с телефона или компьютера.",
    icon: "📈",
  },
];

const steps = [
  {
    number: "1",
    title: "Ребёнок проходит диагностику",
    text: "Около 7 минут. Без регистрации. Сразу по русскому, математике и обществознанию.",
  },
  {
    number: "2",
    title: "Видит темы для повторения",
    text: "Сервис показывает, где были ошибки и какие темы лучше потренировать сначала.",
  },
  {
    number: "3",
    title: "Проходит День 1 бесплатно",
    text: "Можно сразу попробовать формат тренировки и понять, подходит ли ребёнку такой способ подготовки.",
  },
  {
    number: "4",
    title: "Продолжает по плану",
    text: "Если формат подходит, можно открыть 7-дневный план или месяц подготовки.",
  },
];

const tariffs = [
  {
    title: "День 1",
    price: "Бесплатно",
    text: "Диагностика, результат и первая тренировка.",
    badge: "для старта",
  },
  {
    title: "7 дней",
    price: "199 ₽",
    text: "Короткий план на неделю, тренировки и повтор ошибок.",
    badge: "попробовать",
  },
  {
    title: "1 месяц",
    price: "690 ₽",
    text: "Регулярная подготовка по трём предметам.",
    badge: "выгодно",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="relative overflow-hidden px-5 py-6">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-[360px] w-[360px] rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <header className="fixed left-1/2 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-[#050816]/90 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3">
              <span className="rounded-full bg-blue-600 px-4 py-2 text-2xl font-black leading-none text-white shadow-lg shadow-blue-600/30">
                ЕГЭ
              </span>
              <span className="text-2xl font-black tracking-tight text-white">
                Plan
              </span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-300 lg:flex">
              <a href="#how" className="hover:text-white">
                Как работает
              </a>
              <a href="#inside" className="hover:text-white">
                Что внутри
              </a>
              <a href="#price" className="hover:text-white">
                Тарифы
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 sm:block"
              >
                Войти
              </Link>

              <details className="relative">
                <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl font-black text-white hover:bg-white/10">
                  ☰
                </summary>
                <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-white/10 bg-[#0b1020] p-3 shadow-2xl">
                  <a href="#how" className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
                    Как работает
                  </a>
                  <a href="#inside" className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
                    Что внутри
                  </a>
                  <a href="#price" className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">
                    Тарифы
                  </a>
                  <Link href="/ege-diagnostic" className="mt-2 block rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-black text-white">
                    Пройти диагностику
                  </Link>
                  <Link href="/login" className="mt-2 block rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-black text-white">
                    Войти в кабинет
                  </Link>
                </div>
              </details>
            </div>
          </header>

          <div className="grid min-h-screen gap-10 pb-14 pt-32 md:grid-cols-[1.08fr_0.92fr] md:items-center md:pb-20 md:pt-40">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-200">
                <span>Русский · математика · обществознание</span>
              </div>

              <div className="mt-7 text-[4.5rem] font-black leading-none tracking-[-0.08em] text-blue-400 md:text-[7.5rem]">
                ЕГЭ 2026
              </div>

              <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Подготовка, где понятно, что тренировать
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
                EGE Plan помогает ребёнку готовиться спокойнее: сначала
                короткая диагностика по 3 предметам, потом темы для повторения
                и задания на каждый день.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/ege-diagnostic"
                  className="rounded-2xl bg-blue-600 px-7 py-5 text-center text-lg font-black text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-500"
                >
                  Пройти диагностику бесплатно
                </Link>

                <Link
                  href="/register"
                  className="rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-5 text-center text-lg font-black text-white transition hover:bg-white/[0.08]"
                >
                  Создать кабинет
                </Link>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Без регистрации для старта. Диагностика занимает около 7 минут.
                После неё можно пройти первый день бесплатно.
              </p>
            </div>

            <div className="rounded-[2.2rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
              <div className="rounded-[1.8rem] bg-slate-100 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-blue-600">
                    Быстрый срез подготовки
                  </p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    7 минут
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>Русский язык</span>
                      <span>62%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-300">
                      <div className="h-3 w-[62%] rounded-full bg-blue-600" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>Математика</span>
                      <span>48%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-300">
                      <div className="h-3 w-[48%] rounded-full bg-yellow-500" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>Обществознание</span>
                      <span>55%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-300">
                      <div className="h-3 w-[55%] rounded-full bg-red-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.8rem] border border-slate-200 p-5">
                <p className="text-lg font-black">После диагностики ребёнок увидит:</p>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    ✅ какие темы стоит повторить
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    ✅ с чего начать тренировку
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    ✅ план на ближайшие 7 дней
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-white px-5 py-20 text-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Как это работает
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Сначала проверка, потом понятные задания
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Ребёнку не нужно сразу покупать большой курс. Можно начать с
              короткой диагностики и первой тренировки.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {step.number}
                </div>
                <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inside" className="bg-[#f8fafc] px-5 py-20 text-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
                Что внутри
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Тренажёр для регулярной подготовки
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                EGE Plan подходит для самостоятельных занятий и как дополнение
                к репетитору. Главное — ребёнок видит, что делать дальше.
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <p className="text-sm font-bold text-blue-300">
                Короткие занятия вместо перегруза
              </p>
              <p className="mt-3 text-2xl font-black leading-tight">
                10–15 минут в день легче встроить в обычную неделю, чем длинные
                редкие рывки.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-4 text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
              Для родителей
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Видно, чем ребёнок занимается
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              В кабинете сохраняются результаты, прогресс и выбранный предмет.
              Родителю проще понять, какие темы уже проверены и что ребёнок
              тренирует дальше.
            </p>
          </div>

          <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
            <h3 className="text-2xl font-black">
              Это не обещание “100 баллов за неделю”
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Это спокойный способ начать подготовку: проверить уровень,
              увидеть темы для повторения и заниматься короткими шагами.
            </p>
          </div>
        </div>
      </section>

      <section id="price" className="bg-[#050816] px-5 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-300">
              Стоимость
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Доступная подготовка по трём предметам
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Начать можно бесплатно. Полный режим стоит дешевле одного занятия
              с репетитором.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {tariffs.map((tariff) => (
              <div
                key={tariff.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur"
              >
                <span className="rounded-full bg-blue-300/10 px-3 py-1 text-xs font-bold text-blue-200">
                  {tariff.badge}
                </span>
                <h3 className="mt-5 text-2xl font-black">{tariff.title}</h3>
                <p className="mt-3 text-4xl font-black">{tariff.price}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {tariff.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:flex md:items-center md:justify-between md:gap-6">
            <div>
              <h3 className="text-2xl font-black">
                Начните с бесплатной диагностики
              </h3>
              <p className="mt-3 text-slate-300">
                Проверка занимает около 7 минут. После неё можно пройти первый
                день бесплатно.
              </p>
            </div>

            <Link
              href="/ege-diagnostic"
              className="mt-6 block rounded-2xl bg-blue-600 px-7 py-5 text-center text-lg font-black text-white shadow-xl shadow-blue-600/30 md:mt-0"
            >
              Пройти диагностику
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-slate-950">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            ЕГЭ становится спокойнее, когда есть следующий шаг
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Начните с короткой диагностики. Она покажет, какие темы повторить
            и с чего лучше начать тренировку.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/ege-diagnostic"
              className="rounded-2xl bg-blue-600 px-7 py-5 text-center text-lg font-black text-white shadow-xl shadow-blue-600/20"
            >
              Пройти диагностику бесплатно
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-slate-200 px-7 py-5 text-center text-lg font-black text-slate-950"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
