import { getPaymentUserId, getTelegramUserProfile } from "@/lib/storage";

export function trackClientEvent(
  eventName: string,
  metadata: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  try {
    fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        userId: getPaymentUserId(),
        telegramUser: getTelegramUserProfile(),
        metadata: {
          ...metadata,
          path: window.location.pathname,
        },
      }),
    }).catch(() => {
      // noop
    });
  } catch {
    // noop
  }
}
