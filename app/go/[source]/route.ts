import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

const BOT_USERNAME = "ege_trainer_demo_bot";

export async function GET(
  request: Request,
  context: { params: Promise<{ source: string }> }
) {
  const { source } = await context.params;

  const safeSource = String(source || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64);

  const userAgent = request.headers.get("user-agent") || "";
  const referer = request.headers.get("referer") || "";

  await trackEvent({
    eventName: "ad_redirect_click",
    metadata: {
      source: safeSource,
      userAgent,
      referer,
    },
  });

  const telegramUrl = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(safeSource)}`;

  return NextResponse.redirect(telegramUrl, 302);
}
