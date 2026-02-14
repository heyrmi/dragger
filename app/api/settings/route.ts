import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "name",
    "reminderIntervalDays",
    "emailNotifications",
    "pushNotifications",
    "timezone",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      if (field === "reminderIntervalDays") {
        const val = parseInt(body[field]);
        if (isNaN(val) || val < 1 || val > 14) continue;
        updates[field] = val;
      } else if (field === "name") {
        if (typeof body[field] !== "string" || body[field].trim().length === 0) continue;
        updates[field] = body[field].trim();
      } else {
        updates[field] = body[field];
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  await db.update(users).set(updates).where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
