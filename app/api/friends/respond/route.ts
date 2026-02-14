import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { friendships } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendshipId, action } = await request.json();

  if (!friendshipId || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.addresseeId, session.user.id),
        eq(friendships.status, "pending")
      )
    );

  if (!friendship) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const newStatus = action === "accept" ? "accepted" : "declined";

  await db
    .update(friendships)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(friendships.id, friendshipId));

  return NextResponse.json({ status: newStatus });
}
