import Link from "next/link";
import TopMenu from "@/app/components/TopMenu";

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle="документы" />
      <div className="mx-auto w-full max-w-md space-y-6 pt-7">
        <section>
          <p className="text-sm text-slate-500">юридическая информация</p>
          <h1 className="mt-2 text-[2.25rem] font-black leading-[1.04] tracking-[-0.055em]">Контакты</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">Куда обращаться по вопросам работы приложения, оплаты, возвратов и ошибок в заданиях.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Поддержка</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Основной канал связи: Telegram-бот поддержки. Напишите туда, если не работает доступ, возникла ошибка оплаты или нужно сообщить об ошибке в задании.</p>
            <p>Ссылка для обратной связи: https://t.me/ege_trainer_demo_bot?start=feedback</p>
          </div>
          <a href="https://t.me/ege_trainer_demo_bot?start=feedback" target="_blank" rel="noreferrer" className="mt-5 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-semibold text-white">Написать в поддержку</a>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Сообщить об ошибке</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Если вы нашли некорректный вопрос, неправильный вариант ответа или неудачный разбор, используйте пункт меню «Сообщить об ошибке».</p>
            <p>Ссылка для сообщений об ошибках: https://t.me/ege_trainer_demo_bot?start=task_error</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-100 bg-amber-50/70 p-6">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Реквизиты</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Реквизиты владельца сервиса нужно указать здесь перед запуском реальной оплаты.</p>
            <p>Для модерации платёжной системы обычно нужны: наименование, ИНН, ОГРН/ОГРНИП при наличии, юридический адрес или статус самозанятого.</p>
            <p>Название сервиса: ЕГЭ Тренажёр. Формат услуги: цифровой доступ к тренировкам и Pro-функциям в Telegram Mini App.</p>
          </div>
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
