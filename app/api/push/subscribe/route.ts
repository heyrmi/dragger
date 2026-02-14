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

  const subscription = await request.json();

  await db
    .update(users)
    .set({
      pushSubscription: JSON.stringify(subscription),
      pushNotifications: true,
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
