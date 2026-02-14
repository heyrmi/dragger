import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { friendships, dragLogs, users } from "@/lib/db/schema";
import { eq, or, and, gte, desc } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get accepted friends
  const accepted = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))
      )
    );

  const friendIds = accepted.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );

  if (friendIds.length === 0) {
    return NextResponse.json([]);
  }

  // Get friend activity from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const feedItems = await Promise.all(
    friendIds.map(async (friendId) => {
      const logs = await db
        .select({
          id: dragLogs.id,
          type: dragLogs.type,
          dragAt: dragLogs.dragAt,
          note: dragLogs.note,
          createdAt: dragLogs.createdAt,
          userName: users.name,
          userImage: users.image,
          userId: users.id,
        })
        .from(dragLogs)
        .innerJoin(users, eq(dragLogs.userId, users.id))
        .where(and(eq(dragLogs.userId, friendId), gte(dragLogs.createdAt, sevenDaysAgo)))
        .orderBy(desc(dragLogs.createdAt))
        .limit(10);
      return logs;
    })
  );

  const allItems = feedItems
    .flat()
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 50);

  return NextResponse.json(allItems);
}
