import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { friendships, users, dragLogs } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { calculateCurrentStreak } from "@/lib/utils/streak";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get all friendships involving this user
  const allFriendships = await db
    .select()
    .from(friendships)
    .where(or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)));

  const pending = allFriendships.filter(
    (f) => f.status === "pending" && f.addresseeId === userId
  );
  const sent = allFriendships.filter(
    (f) => f.status === "pending" && f.requesterId === userId
  );
  const accepted = allFriendships.filter((f) => f.status === "accepted");

  // Get friend user IDs
  const friendUserIds = accepted.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );
  const pendingUserIds = pending.map((f) => f.requesterId);
  const sentUserIds = sent.map((f) => f.addresseeId);

  const allUserIds = [...new Set([...friendUserIds, ...pendingUserIds, ...sentUserIds])];

  if (allUserIds.length === 0) {
    return NextResponse.json({ friends: [], pending: [], sent: [] });
  }

  // Fetch user details
  const usersList = await db.select().from(users).where(
    or(...allUserIds.map((id) => eq(users.id, id)))
  );

  const usersMap = new Map(usersList.map((u) => [u.id, u]));

  // Fetch logs for friends to compute streaks
  const friendLogsPromises = friendUserIds.map((fId) =>
    db
      .select()
      .from(dragLogs)
      .where(eq(dragLogs.userId, fId))
      .orderBy(desc(dragLogs.createdAt))
  );
  const friendLogs = await Promise.all(friendLogsPromises);
  const friendStreaks = new Map<string, number>();
  friendUserIds.forEach((fId, i) => {
    const user = usersMap.get(fId);
    const streak = calculateCurrentStreak(friendLogs[i], user?.timezone || "UTC");
    friendStreaks.set(fId, streak.days === -1 ? 0 : streak.days);
  });

  const friendsData = accepted.map((f) => {
    const friendId = f.requesterId === userId ? f.addresseeId : f.requesterId;
    const friend = usersMap.get(friendId);
    return {
      friendshipId: f.id,
      id: friendId,
      name: friend?.name || "Unknown",
      image: friend?.image,
      currentStreak: friendStreaks.get(friendId) || 0,
      createdAt: f.createdAt,
    };
  });

  const pendingData = pending.map((f) => {
    const requester = usersMap.get(f.requesterId);
    return {
      friendshipId: f.id,
      id: f.requesterId,
      name: requester?.name || "Unknown",
      image: requester?.image,
      createdAt: f.createdAt,
    };
  });

  const sentData = sent.map((f) => {
    const addressee = usersMap.get(f.addresseeId);
    return {
      friendshipId: f.id,
      id: f.addresseeId,
      name: addressee?.name || "Unknown",
      image: addressee?.image,
      createdAt: f.createdAt,
    };
  });

  return NextResponse.json({
    friends: friendsData,
    pending: pendingData,
    sent: sentData,
  });
}
