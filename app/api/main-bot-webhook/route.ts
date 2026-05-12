import { NextRequest, NextResponse } from "next/server";
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

type ButtonRow = Array<{
  text: string;
  web_app?: {
    url: string;
  };
  url?: string;
  callback_data?: string;
}>;

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

async function sendMessage(chatId: number, text: string, inlineKeyboard: ButtonRow[]) {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
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

async function upsertReminderSubscriber(params: {
  chatId: number;
  telegramId?: string | null;
  telegramUsername?: string | null;
  telegramFirstName?: string | null;
  telegramLastName?: string | null;
  startPayload?: string | null;
}) {
  await ensureReminderTable();

  await db.query(
    `
      insert into reminder_subscribers (
        chat_id,
        telegram_id,
        telegram_username,
        telegram_first_name,
        telegram_last_name,
        start_payload,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, now())
      on conflict (chat_id)
      do update set
        telegram_id = coalesce(excluded.telegram_id, reminder_subscribers.telegram_id),
        telegram_username = coalesce(excluded.telegram_username, reminder_subscribers.telegram_username),
        telegram_first_name = coalesce(excluded.telegram_first_name, reminder_subscribers.telegram_first_name),
        telegram_last_name = coalesce(excluded.telegram_last_name, reminder_subscribers.telegram_last_name),
        start_payload = coalesce(excluded.start_payload, reminder_subscribers.start_payload),
        updated_at = now()
    `,
    [
      String(params.chatId),
      params.telegramId || null,
      params.telegramUsername || null,
      params.telegramFirstName || null,
      params.telegramLastName || null,
      params.startPayload || null,
    ]
  );
}

async function setReminderStatus(chatId: number, enabled: boolean) {
  await ensureReminderTable();

  await db.query(
    `
      insert into reminder_subscribers (chat_id, enabled, reminder_day, updated_at)
      values ($1, $2, 0, now())
      on conflict (chat_id)
      do update set
        enabled = excluded.enabled,
        reminder_day = case
          when excluded.enabled = false then reminder_subscribers.reminder_day
          else reminder_subscribers.reminder_day
        end,
        updated_at = now()
    `,
    [String(chatId), enabled]
  );
}

function reminderChoiceButtons(): ButtonRow[] {
  return [
    [
      {
        text: "Да, напоминать каждый день",
        callback_data: "reminders_on",
      },
    ],
    [
      {
        text: "Нет, спасибо",
        callback_data: "reminders_off",
      },
    ],
  ];
}

function getStartPayload(text: string) {
  if (!text.startsWith("/start")) return "";
  return text.replace("/start", "").trim();
}

function buildStartScenario(payload: string) {
  if (payload === "buy_weekly_after_diagnostic") {
    return {
      text: `🔥 Твой план на 7 дней готов.

Мы уже нашли слабые темы после диагностики. Теперь задача простая: каждый день по 10–15 минут тренировать именно то, где теряются баллы.

В Pro на 7 дней:
✅ тренировки по слабым темам;
✅ мини-варианты без лимита;
✅ разбор ошибок;
✅ прогресс в личном кабинете;
✅ поддержка через бота.

Хочешь, я буду напоминать о тренировке каждый день?`,
      keyboard: [
        [
          {
            text: "Открыть Pro на 7 дней",
            web_app: {
              url: getAppUrl("/paywall?source=tg_weekly_after_diagnostic"),
            },
          },
        ],
        [
          {
            text: "Тренировка на сегодня",
            web_app: {
              url: getAppUrl("/task-training?source=tg_today_task"),
            },
          },
        ],
        ...reminderChoiceButtons(),
      ],
    };
  }

  if (payload === "site_diagnostic_result") {
    return {
      text: `✅ Результат диагностики можно сохранить здесь.

Telegram будет личным кабинетом EGE Trainer:
📌 слабые темы;
📈 прогресс;
🧠 ежедневные задания;
🚀 тренировки;
💬 поддержка.

Хочешь, я буду напоминать о тренировке каждый день?`,
      keyboard: [
        [
          {
            text: "Личный кабинет",
            web_app: {
              url: getAppUrl("/profile?source=tg_saved_result"),
            },
          },
        ],
        [
          {
            text: "Тренировка на сегодня",
            web_app: {
              url: getAppUrl("/task-training?source=tg_today_task"),
            },
          },
        ],
        [
          {
            text: "Pro на 7 дней",
            web_app: {
              url: getAppUrl("/paywall?source=tg_saved_result"),
            },
          },
        ],
        ...reminderChoiceButtons(),
      ],
    };
  }

  return {
    text: `👋 Привет! Это твой личный ЕГЭ-тренер в Telegram.

Я помогу готовиться к ЕГЭ по понятному плану:

🎯 найти слабые места;
🧠 тренироваться по заданиям;
📌 разбирать ошибки;
📈 видеть прогресс;
🚀 заниматься каждый день по 10–15 минут.

Начни с бесплатной диагностики — это займёт около 7 минут.

Хочешь, я буду напоминать о короткой тренировке каждый день?`,
    keyboard: [
      [
        {
          text: "Начать диагностику",
          web_app: {
            url: getAppUrl("/ege-diagnostic?source=tg_start"),
          },
        },
      ],
      [
        {
          text: "Личный кабинет",
          web_app: {
            url: getAppUrl("/profile?source=tg_cabinet"),
          },
        },
      ],
      ...reminderChoiceButtons(),
    ],
  };
}

async function handleCallbackQuery(update: any) {
  const callbackQuery = update.callback_query;
  const callbackId = callbackQuery?.id;
  const data = String(callbackQuery?.data || "");
  const chatId = callbackQuery?.message?.chat?.id || callbackQuery?.from?.id;

  if (!callbackId || !chatId) return;

  if (data === "reminders_on") {
    await setReminderStatus(chatId, true);

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: "Напоминания включены ✅",
    });

    await sendMessage(
      chatId,
      `Готово ✅

Я буду напоминать о короткой тренировке каждый день.

Если захочешь отключить — нажми кнопку в любом напоминании.`,
      [
        [
          {
            text: "Тренировка на сегодня",
            web_app: {
              url: getAppUrl("/task-training?source=reminder_enabled"),
            },
          },
        ],
        [
          {
            text: "Отключить напоминания",
            callback_data: "reminders_off",
          },
        ],
      ]
    );

    return;
  }

  if (data === "reminders_off") {
    await setReminderStatus(chatId, false);

    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackId,
      text: "Напоминания отключены",
    });

    await sendMessage(
      chatId,
      `Ок, напоминания отключены.

Ты всё равно можешь вернуться к тренировке в любой момент 👇`,
      [
        [
          {
            text: "Открыть EGE Trainer",
            web_app: {
              url: getAppUrl("/home?source=reminders_off"),
            },
          },
        ],
      ]
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.callback_query) {
      await handleCallbackQuery(update);
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message?.chat?.id;
    const text = String(message?.text || "");

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    if (text === "/start" || text.startsWith("/start ")) {
      const payload = getStartPayload(text);

      await upsertReminderSubscriber({
        chatId,
        telegramId: message?.from?.id ? String(message.from.id) : String(chatId),
        telegramUsername: message?.from?.username || null,
        telegramFirstName: message?.from?.first_name || null,
        telegramLastName: message?.from?.last_name || null,
        startPayload: payload,
      });

      await trackEvent({
        eventName: "main_bot_start",
        userId: chatId ? `tg:${String(chatId)}` : null,
        telegramId: message?.from?.id ? String(message.from.id) : String(chatId),
        telegramUsername: message?.from?.username || null,
        telegramFirstName: message?.from?.first_name || null,
        telegramLastName: message?.from?.last_name || null,
        metadata: {
          text,
          payload,
        },
      });

      const scenario = buildStartScenario(payload);
      await sendMessage(chatId, scenario.text, scenario.keyboard);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Main bot webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
