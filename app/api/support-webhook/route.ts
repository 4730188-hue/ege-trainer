import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TELEGRAM_API_URL = "https://api.telegram.org";

type TelegramMessage = {
  message_id: number;
  chat?: {
    id: number;
    type?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  from?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_bot?: boolean;
  };
  text?: string;
  caption?: string;
  reply_to_message?: {
    message_id: number;
  };
};

type TelegramUpdate = {
  message?: TelegramMessage;
};

function getBotToken() {
  const token = process.env.SUPPORT_BOT_TOKEN;

  if (!token) {
    throw new Error("SUPPORT_BOT_TOKEN is missing");
  }

  return token;
}

function getAdminChatId() {
  const chatId = process.env.SUPPORT_ADMIN_CHAT_ID;

  if (!chatId) {
    throw new Error("SUPPORT_ADMIN_CHAT_ID is missing");
  }

  return chatId;
}

async function telegramApi(method: string, body: Record<string, unknown>) {
  const response = await fetch(`${TELEGRAM_API_URL}/bot${getBotToken()}/${method}`, {
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

async function ensureSupportTable() {
  await db.query(`
    create table if not exists support_messages (
      id bigserial primary key,
      admin_chat_id text not null,
      admin_message_id bigint not null,
      user_chat_id text not null,
      user_message_id bigint,
      telegram_username text,
      telegram_first_name text,
      telegram_last_name text,
      created_at timestamptz not null default now()
    );

    create index if not exists support_messages_admin_reply_idx
      on support_messages(admin_chat_id, admin_message_id);
  `);
}

function formatUserLine(message: TelegramMessage) {
  const chat = message.chat;
  const username = chat?.username ? `@${chat.username}` : "без username";
  const name = [chat?.first_name, chat?.last_name].filter(Boolean).join(" ") || "без имени";

  return [
    "📩 Новое обращение в поддержку EGE Trainer",
    "",
    `Chat ID: ${chat?.id}`,
    `Username: ${username}`,
    `Имя: ${name}`,
    "",
    "Ответь reply на это сообщение — бот отправит ответ пользователю.",
  ].join("\n");
}

async function saveSupportMapping(params: {
  adminMessageId: number;
  userChatId: number;
  userMessageId?: number;
  message: TelegramMessage;
}) {
  await db.query(
    `
      insert into support_messages (
        admin_chat_id,
        admin_message_id,
        user_chat_id,
        user_message_id,
        telegram_username,
        telegram_first_name,
        telegram_last_name
      )
      values ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      getAdminChatId(),
      params.adminMessageId,
      String(params.userChatId),
      params.userMessageId ?? null,
      params.message.chat?.username ?? params.message.from?.username ?? null,
      params.message.chat?.first_name ?? params.message.from?.first_name ?? null,
      params.message.chat?.last_name ?? params.message.from?.last_name ?? null,
    ]
  );
}

async function handleAdminReply(message: TelegramMessage) {
  const replyToMessageId = message.reply_to_message?.message_id;

  if (!replyToMessageId) {
    await telegramApi("sendMessage", {
      chat_id: getAdminChatId(),
      text: "Чтобы ответить пользователю, нажми Reply на его обращение и отправь сообщение.",
    });
    return;
  }

  const result = await db.query(
    `
      select user_chat_id
      from support_messages
      where admin_chat_id = $1
        and admin_message_id = $2
      order by created_at desc
      limit 1
    `,
    [getAdminChatId(), replyToMessageId]
  );

  const userChatId = result.rows[0]?.user_chat_id;

  if (!userChatId) {
    await telegramApi("sendMessage", {
      chat_id: getAdminChatId(),
      text: "Не нашёл пользователя для этого reply. Ответь именно на пересланное обращение пользователя.",
    });
    return;
  }

  await telegramApi("copyMessage", {
    chat_id: userChatId,
    from_chat_id: getAdminChatId(),
    message_id: message.message_id,
  });

  await telegramApi("sendMessage", {
    chat_id: getAdminChatId(),
    text: "✅ Ответ отправлен пользователю.",
  });
}

async function handleUserMessage(message: TelegramMessage) {
  const userChatId = message.chat?.id;

  if (!userChatId) return;

  const adminIntro = await telegramApi("sendMessage", {
    chat_id: getAdminChatId(),
    text: formatUserLine(message),
  });

  await saveSupportMapping({
    adminMessageId: adminIntro.message_id,
    userChatId,
    userMessageId: message.message_id,
    message,
  });

  const copiedMessage = await telegramApi("copyMessage", {
    chat_id: getAdminChatId(),
    from_chat_id: userChatId,
    message_id: message.message_id,
  });

  await saveSupportMapping({
    adminMessageId: copiedMessage.message_id,
    userChatId,
    userMessageId: message.message_id,
    message,
  });

  await telegramApi("sendMessage", {
    chat_id: userChatId,
    text: "Спасибо! Сообщение дошло до поддержки EGE Trainer. Ответим здесь.",
  });
}

export async function POST(request: NextRequest) {
  try {
    await ensureSupportTable();

    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;

    if (!message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    if (String(message.chat.id) === getAdminChatId()) {
      await handleAdminReply(message);
    } else {
      await handleUserMessage(message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Support webhook error", error);
    return NextResponse.json({ ok: true });
  }
}
