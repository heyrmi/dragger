import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { friendships } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendshipId } = await params;

  // Only allow deleting friendships the user is part of
  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        or(
          eq(friendships.requesterId, session.user.id),
          eq(friendships.addresseeId, session.user.id)
        )
      )
    );

  if (!friendship) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  await db.delete(friendships).where(eq(friendships.id, friendshipId));

  return NextResponse.json({ success: true });
}
