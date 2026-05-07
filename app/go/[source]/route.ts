import { NextResponse } from "next/server";

const BOT_USERNAME = "ege_trainer_demo_bot";

export async function GET(
  _request: Request,
  context: { params: Promise<{ source: string }> }
) {
  const { source } = await context.params;

  const safeSource = String(source || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64);

  const telegramUrl = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(safeSource)}`;

  return NextResponse.redirect(telegramUrl, 302);
}
