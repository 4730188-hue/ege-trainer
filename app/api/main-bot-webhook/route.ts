import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_API_URL = "https://api.telegram.org";

function getMainBotToken() {
  const token = process.env.MAIN_BOT_TOKEN;

  if (!token) {
    throw new Error("MAIN_BOT_TOKEN is missing");
  }

  return token;
}

async function sendMessage(chatId: number, text: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ege-trainer-liart.vercel.app";

  await fetch(`${TELEGRAM_API_URL}/bot${getMainBotToken()}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Начать тренировку",
              web_app: {
                url: appUrl,
              },
            },
          ],
        ],
      },
    }),
  });
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
      await sendMessage(
        chatId,
        `👋 Привет! Это твой личный ЕГЭ-тренер в Telegram.

Я помогу готовиться к ЕГЭ по понятному плану:

🎯 найти слабые места;
🧠 тренироваться по заданиям;
📌 разбирать ошибки;
📈 видеть прогресс;
🚀 заниматься каждый день по 10–15 минут.

Начни с бесплатной диагностики — это займёт около 5 минут.

Нажми кнопку «Начать тренировку» ниже 👇`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Main bot webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
