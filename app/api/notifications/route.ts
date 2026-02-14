import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nudges, users } from "@/lib/db/schema";
import { eq, isNull, desc, and } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unread = await db
    .select({
      id: nudges.id,
      message: nudges.message,
      createdAt: nudges.createdAt,
      fromUserName: users.name,
      fromUserImage: users.image,
      fromUserId: users.id,
    })
    .from(nudges)
    .innerJoin(users, eq(nudges.fromUserId, users.id))
    .where(and(eq(nudges.toUserId, session.user.id), isNull(nudges.readAt)))
    .orderBy(desc(nudges.createdAt))
    .limit(20);

  return NextResponse.json(unread);
}
