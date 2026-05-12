import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/analytics";

const TELEGRAM_API_URL = "https://api.telegram.org";

function getMainBotToken() {
  const token = process.env.MAIN_BOT_TOKEN;

  if (!token) {
    throw new Error("MAIN_BOT_TOKEN is missing");
  }

  return token;
}

function getAppUrl(path = "") {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ege-trainer-liart.vercel.app";
  return `${appUrl}${path}`;
}

async function ensureReminderTable() {
  await db.query(`
    create table if not exists reminder_subscribers (
      id bigserial primary key,
      chat_id text not null unique,
      telegram_id text,
      telegram_username text,
      telegram_first_name text,
      telegram_last_name text,
      enabled boolean not null default false,
      reminder_day int not null default 0,
      start_payload text,
      last_reminder_sent_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index if not exists reminder_subscribers_enabled_idx
      on reminder_subscribers(enabled);
  `);
}

async function telegramApi(method: string, body: Record<string, unknown>) {
  const response = await fetch(`${TELEGRAM_API_URL}/bot${getMainBotToken()}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    console.error(`Telegram ${method} error`, data);
    throw new Error(`Telegram ${method} failed`);
  }

  return data.result;
}

const reminderTexts = [
  `👋 День 1 плана

Ты уже прошёл диагностику. Сегодня достаточно 10–15 минут, чтобы начать закрывать первую слабую тему.

Нажми кнопку и продолжи тренировку 👇`,

  `🧠 День 2

Слабые темы подтягиваются не рывком, а короткой регулярной практикой.

Сегодня — ещё одна тренировка на 10–15 минут.`,

  `📌 День 3

Не бросай план на середине. Чем чаще повторяешь ошибки, тем быстрее они перестают забирать баллы.`,

  `🚀 День 4

Половина недели почти пройдена. Самое время сделать короткую тренировку и закрепить тему.`,

  `🔥 День 5

Сегодня можно пройти мини-срез и проверить, стало ли легче на похожих заданиях.`,

  `📈 День 6

Остался один шаг до недельного среза. Продолжим тренировку по слабой теме?`,

  `✅ День 7

Неделя почти завершена. Проверь прогресс и реши, какие темы тренировать дальше.`,
];

function getReminderText(reminderDay: number) {
  return reminderTexts[reminderDay % reminderTexts.length];
}

export async function GET() {
  try {
    await ensureReminderTable();

    const subscribers = await db.query(
      `
        select
          chat_id,
          telegram_id,
          telegram_username,
          telegram_first_name,
          telegram_last_name,
          reminder_day
        from reminder_subscribers
        where enabled = true
          and (
            last_reminder_sent_at is null
            or last_reminder_sent_at < date_trunc('day', now())
          )
        order by last_reminder_sent_at nulls first, created_at asc
        limit 100
      `
    );

    let sent = 0;

    for (const subscriber of subscribers.rows) {
      const chatId = subscriber.chat_id;
      const reminderDay = Number(subscriber.reminder_day || 0);

      try {
        await telegramApi("sendMessage", {
          chat_id: chatId,
          text: getReminderText(reminderDay),
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Продолжить тренировку",
                  web_app: {
                    url: getAppUrl("/task-training?source=daily_reminder"),
                  },
                },
              ],
              [
                {
                  text: "Открыть план на 7 дней",
                  web_app: {
                    url: getAppUrl("/paywall?source=daily_reminder"),
                  },
                },
              ],
              [
                {
                  text: "Отключить напоминания",
                  callback_data: "reminders_off",
                },
              ],
            ],
          },
        });

        await db.query(
          `
            update reminder_subscribers
            set
              reminder_day = reminder_day + 1,
              last_reminder_sent_at = now(),
              updated_at = now()
            where chat_id = $1
          `,
          [chatId]
        );

        await trackEvent({
          eventName: "daily_reminder_sent",
          userId: `tg:${chatId}`,
          telegramId: subscriber.telegram_id || chatId,
          telegramUsername: subscriber.telegram_username,
          telegramFirstName: subscriber.telegram_first_name,
          telegramLastName: subscriber.telegram_last_name,
          metadata: {
            reminderDay,
          },
        });

        sent += 1;
      } catch (error) {
        console.error("Reminder send error", chatId, error);
      }
    }

    return NextResponse.json({
      ok: true,
      sent,
    });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "send_reminders_failed",
      },
      { status: 500 }
    );
  }
}
