import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAnalyticsTable } from "@/lib/analytics";

function getExcludedUserIds() {
  return String(process.env.ANALYTICS_EXCLUDED_USER_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAnalyticsWhereClause() {
  const excludedIds = getExcludedUserIds();

  if (!excludedIds.length) {
    return {
      where: "",
      params: [] as unknown[],
    };
  }

  return {
    where: `
      where coalesce(user_id, '') <> all($1::text[])
        and coalesce(telegram_id, '') <> all($1::text[])
        and coalesce('tg:' || telegram_id, '') <> all($1::text[])
    `,
    params: [excludedIds] as unknown[],
  };
}

function isAuthorized(request: NextRequest) {
  const password = process.env.STATS_ADMIN_PASSWORD;

  if (!password) {
    return false;
  }

  const requestPassword = request.nextUrl.searchParams.get("password");

  return requestPassword === password;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await ensureAnalyticsTable();

  const analyticsFilter = getAnalyticsWhereClause();

  const [
    eventTotals,
    todayTotals,
    paymentTotals,
    activeSubscriptions,
    recentEvents,
  ] = await Promise.all([
    db.query(
      `
        select event_name, count(*)::int as count
        from bot_events
        ${analyticsFilter.where}
        group by event_name
        order by count desc
      `,
      analyticsFilter.params
    ),

    db.query(
      `
        select event_name, count(*)::int as count
        from bot_events
        ${
          analyticsFilter.where
            ? analyticsFilter.where + " and created_at >= date_trunc('day', now())"
            : "where created_at >= date_trunc('day', now())"
        }
        group by event_name
        order by count desc
      `,
      analyticsFilter.params
    ),

    db.query(`
      select
        count(*)::int as total_payments,
        count(*) filter (where status = 'succeeded')::int as succeeded_payments,
        coalesce(sum(amount) filter (where status = 'succeeded'), 0)::numeric as revenue
      from payments
    `),

    db.query(`
      select count(*)::int as active_subscriptions
      from subscriptions
      where active = true
        and expires_at > now()
    `),

    db.query(
      `
        select
          event_name,
          user_id,
          telegram_id,
          telegram_username,
          telegram_first_name,
          telegram_last_name,
          metadata,
          created_at
        from bot_events
        ${analyticsFilter.where}
        order by created_at desc
        limit 50
      `,
      analyticsFilter.params
    ),
  ]);

  return NextResponse.json({
    eventTotals: eventTotals.rows,
    todayTotals: todayTotals.rows,
    payments: paymentTotals.rows[0],
    activeSubscriptions: activeSubscriptions.rows[0]?.active_subscriptions || 0,
    recentEvents: recentEvents.rows,
  });
}
