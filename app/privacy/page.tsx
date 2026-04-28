import Link from "next/link";
import TopMenu from "@/app/components/TopMenu";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle="документы" />
      <div className="mx-auto w-full max-w-md space-y-6 pt-7">
        <section>
          <p className="text-sm text-slate-500">юридическая информация</p>
          <h1 className="mt-2 text-[2.25rem] font-black leading-[1.04] tracking-[-0.055em]">Политика конфиденциальности</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">Как ЕГЭ Тренажёр обрабатывает данные пользователя при работе с приложением и оплатой Pro-доступа.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Какие данные используются</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Приложение может обрабатывать выбранный предмет, цель подготовки, результаты тренировок, ошибки, прогресс, статус подписки и технические данные, необходимые для работы сервиса.</p>
            <p>При подключении оплаты могут обрабатываться идентификатор пользователя Telegram, сведения о тарифе, статус платежа и данные, которые передаёт платёжный провайдер.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Зачем нужны данные</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Данные используются для работы тренажёра: подбора заданий, сохранения прогресса, повторения ошибок, отображения статуса Pro и обработки обращений в поддержку.</p>
            <p>Мы не продаём персональные данные третьим лицам. Данные могут передаваться платёжному провайдеру только в объёме, необходимом для проведения оплаты и исполнения закона.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Хранение и безопасность</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Часть учебного прогресса может храниться локально в браузере пользователя. После подключения реальной оплаты статус подписки будет проверяться через сервер и базу данных.</p>
            <p>Пользователь может обратиться в поддержку, чтобы уточнить, исправить или удалить данные, если это не противоречит требованиям закона и бухгалтерского учёта.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-100 bg-amber-50/70 p-6">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Важно</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Это рабочая версия политики. Перед запуском реальной оплаты нужно заполнить реквизиты владельца сервиса и финальные юридические данные.</p>
        </section>

        <LegalLinks />
      </div>
    </main>
  );
}

function LegalLinks() {
  return (
    <div className="grid grid-cols-3 gap-2 text-center text-sm">
      <Link href="/privacy" className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-600">Политика</Link>
      <Link href="/offer" className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-600">Оферта</Link>
      <Link href="/contacts" className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-slate-600">Контакты</Link>
    </div>
  );
}
