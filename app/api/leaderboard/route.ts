import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { friendships, users, dragLogs } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { calculateCurrentStreak, calculateLongestStreak } from "@/lib/utils/streak";

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

  // Include current user
  const allIds = [userId, ...friendIds];

  // Fetch all users and their logs
  const allUsers = await db.select().from(users).where(
    or(...allIds.map((id) => eq(users.id, id)))
  );

  const rankings = await Promise.all(
    allUsers.map(async (user) => {
      const logs = await db
        .select()
        .from(dragLogs)
        .where(eq(dragLogs.userId, user.id))
        .orderBy(desc(dragLogs.createdAt));

      const tz = user.timezone || "UTC";
      const current = calculateCurrentStreak(logs, tz);
      const longest = calculateLongestStreak(logs, user.createdAt!, tz);

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        currentStreak: current.days === -1 ? 0 : current.days,
        longestStreak: longest,
        isCurrentUser: user.id === userId,
      };
    })
  );

  // Sort by current streak descending
  rankings.sort((a, b) => b.currentStreak - a.currentStreak);

  return NextResponse.json(rankings);
}
