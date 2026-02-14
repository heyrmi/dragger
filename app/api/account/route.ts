import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sessions, accounts, dragLogs, friendships, nudges } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function DELETE() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Delete all user data (cascade should handle most, but be explicit)
  await Promise.all([
    db.delete(nudges).where(or(eq(nudges.fromUserId, userId), eq(nudges.toUserId, userId))),
    db
      .delete(friendships)
      .where(or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))),
    db.delete(dragLogs).where(eq(dragLogs.userId, userId)),
    db.delete(sessions).where(eq(sessions.userId, userId)),
    db.delete(accounts).where(eq(accounts.userId, userId)),
  ]);

  await db.delete(users).where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
