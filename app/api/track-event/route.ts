import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const eventName = String(body.eventName || "").trim();
    const userId = body.userId ? String(body.userId) : null;
    const telegramUser = body.telegramUser || {};
    const metadata = body.metadata || {};

    if (!eventName) {
      return NextResponse.json(
        { error: "eventName is required" },
        { status: 400 }
      );
    }

    await trackEvent({
      eventName,
      userId,
      telegramId: telegramUser.id ? String(telegramUser.id) : null,
      telegramUsername: telegramUser.username || null,
      telegramFirstName: telegramUser.firstName || null,
      telegramLastName: telegramUser.lastName || null,
      metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track event error:", error);
    return NextResponse.json({ ok: true });
  }
}
