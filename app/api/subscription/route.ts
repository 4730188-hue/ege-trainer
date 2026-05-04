import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = String(searchParams.get("userId") || "").trim();

    if (!userId) {
      return NextResponse.json({ active: false, error: "userId is required" }, { status: 400 });
    }

    const result = await db.query(
      `
        select user_id, plan, active, starts_at, expires_at
        from subscriptions
        where user_id = $1
          and active = true
          and expires_at > now()
        limit 1
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({ active: true, subscription: result.rows[0] });
  } catch (error) {
    console.error("Subscription check error", error);
    return NextResponse.json({ active: false, error: "Subscription check failed" }, { status: 500 });
  }
}
