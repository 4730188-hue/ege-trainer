import { NextRequest, NextResponse } from "next/server";
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
}>;

async function sendMessage(chatId: number, text: string, inlineKeyboard: ButtonRow[]) {
  await fetch(`${TELEGRAM_API_URL}/bot${getMainBotToken()}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    }),
  });
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

Нажми «Открыть Pro на 7 дней» 👇`,
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
            text: "Личный кабинет",
            web_app: {
              url: getAppUrl("/profile?source=tg_cabinet"),
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
      ],
    };
  }

  if (payload === "site_diagnostic_result") {
    return {
      text: `✅ Результат диагностики можно сохранить здесь.

Telegram будет твоим личным кабинетом EGE Trainer:
📌 слабые темы;
📈 прогресс;
🧠 ежедневные задания;
🚀 тренировки;
💬 поддержка.

Начни с тренировки на сегодня или открой личный кабинет 👇`,
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

Начни с бесплатной диагностики — это займёт около 5 минут.

Нажми кнопку ниже 👇`,
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
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    const message = update.message;
    const chatId = message?.chat?.id;
    const text = String(message?.text || "");

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    if (text === "/start" || text.startsWith("/start ")) {
      const payload = getStartPayload(text);

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
