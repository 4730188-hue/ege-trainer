import Link from "next/link";
import TopMenu from "@/app/components/TopMenu";

export default function OfferPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 pb-10 text-slate-950">
      <TopMenu subtitle="документы" />
      <div className="mx-auto w-full max-w-md space-y-6 pt-7">
        <section>
          <p className="text-sm text-slate-500">юридическая информация</p>
          <h1 className="mt-2 text-[2.25rem] font-black leading-[1.04] tracking-[-0.055em]">Публичная оферта</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">Условия покупки и использования Pro-доступа в ЕГЭ Тренажёре.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Предмет услуги</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Сервис предоставляет цифровой доступ к образовательному тренажёру для подготовки к ЕГЭ: тренировкам по предметам, мини-вариантам, разбору ошибок, повтору слабых мест и отслеживанию прогресса.</p>
            <p>Pro-доступ открывает расширенные возможности приложения на выбранный период тарифа.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Тарифы и оплата</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Актуальные тарифы отображаются на странице Pro перед оплатой. Сейчас планируются тарифы 1 месяц и 3 месяца.</p>
            <p>Оплата будет проводиться через подключённого платёжного провайдера. После успешного платежа доступ активируется автоматически или после проверки статуса оплаты сервером.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Возвраты и поддержка</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Если оплата прошла, но доступ не активировался, пользователь может обратиться в поддержку. Мы проверим платёж и восстановим доступ или оформим возврат при подтверждённой ошибке.</p>
            <p>Возврат рассматривается по обращению пользователя и с учётом факта оказания цифровой услуги, правил платёжного провайдера и требований законодательства.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Ограничения</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Сервис помогает тренироваться и отслеживать прогресс, но не гарантирует конкретный балл на экзамене: результат зависит от регулярности занятий, стартового уровня и внешних факторов.</p>
            <p>Контент приложения является учебным и не является официальным материалом ФИПИ. В интерфейсе используются безопасные формулировки: типовые задания по формату ЕГЭ и по структуре экзамена.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-100 bg-amber-50/70 p-6">
          <h2 className="text-xl font-bold tracking-[-0.035em]">Важно</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Перед подключением реальной оплаты нужно заменить этот текст на финальную оферту с реквизитами владельца сервиса, ИНН/ОГРН или данными самозанятого/ИП/ООО.</p>
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
