import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { friendships, users } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: targetId, email } = await request.json();
  let friendId = targetId;

  // If email provided, look up user
  if (!friendId && email) {
    const [target] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    friendId = target.id;
  }

  if (!friendId) {
    return NextResponse.json({ error: "userId or email required" }, { status: 400 });
  }

  if (friendId === session.user.id) {
    return NextResponse.json({ error: "Can't add yourself" }, { status: 400 });
  }

  // Check if friendship already exists in either direction
  const existing = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, session.user.id), eq(friendships.addresseeId, friendId)),
        and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, session.user.id))
      )
    );

  if (existing.length > 0) {
    const f = existing[0];
    // Handle simultaneous request: if they already sent us a pending request, auto-accept
    if (f.status === "pending" && f.requesterId === friendId) {
      await db
        .update(friendships)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(friendships.id, f.id));
      return NextResponse.json({ status: "accepted", auto: true });
    }
    return NextResponse.json(
      { error: "Friendship already exists" },
      { status: 409 }
    );
  }

  const [friendship] = await db
    .insert(friendships)
    .values({
      requesterId: session.user.id,
      addresseeId: friendId,
      status: "pending",
    })
    .returning();

  return NextResponse.json(friendship, { status: 201 });
}
