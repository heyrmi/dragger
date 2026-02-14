import { db } from "@/lib/db";
import { dragLogs, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  countNoChangeEntries,
  daysSinceJoining,
} from "@/lib/utils/streak";

export async function getUserStats(userId: string) {
  const [userLogs, user] = await Promise.all([
    db
      .select()
      .from(dragLogs)
      .where(eq(dragLogs.userId, userId))
      .orderBy(desc(dragLogs.createdAt)),
    db.select().from(users).where(eq(users.id, userId)).limit(1),
  ]);

  if (!user[0]) return null;

  const timezone = user[0].timezone || "UTC";
  const currentStreak = calculateCurrentStreak(userLogs, timezone);
  const longestStreak = calculateLongestStreak(
    userLogs,
    user[0].createdAt!,
    timezone
  );
  const noChangeCount = countNoChangeEntries(userLogs);
  const daysOnDragger = daysSinceJoining(user[0].createdAt!, timezone);

  return {
    currentStreak: currentStreak.days === -1 ? daysOnDragger : currentStreak.days,
    lastDragAt: currentStreak.lastDragAt,
    longestStreak,
    noChangeCount,
    daysOnDragger,
    neverDragged: currentStreak.days === -1,
  };
}
