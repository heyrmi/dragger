import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nudges, friendships, users } from "@/lib/db/schema";
import { eq, and, or, gte } from "drizzle-orm";
import { getServerSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { nudgeEmailHtml } from "@/lib/email-templates/nudge";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendId, message } = await request.json();

  if (!friendId) {
    return NextResponse.json({ error: "friendId required" }, { status: 400 });
  }

  // Verify friendship exists and is accepted
  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          and(eq(friendships.requesterId, session.user.id), eq(friendships.addresseeId, friendId)),
          and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, session.user.id))
        )
      )
    );

  if (!friendship) {
    return NextResponse.json({ error: "Not friends" }, { status: 403 });
  }

  // Rate limit: 1 nudge per friend per 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentNudge = await db
    .select()
    .from(nudges)
    .where(
      and(
        eq(nudges.fromUserId, session.user.id),
        eq(nudges.toUserId, friendId),
        gte(nudges.createdAt, oneDayAgo)
      )
    );

  if (recentNudge.length > 0) {
    return NextResponse.json(
      { error: "You already nudged them today. Give them a bit!" },
      { status: 429 }
    );
  }

  const [nudge] = await db
    .insert(nudges)
    .values({
      fromUserId: session.user.id,
      toUserId: friendId,
      message: message || `${session.user.name} is wondering how you're doing!`,
    })
    .returning();

  // Send email notification
  const [friend] = await db
    .select()
    .from(users)
    .where(eq(users.id, friendId))
    .limit(1);

  if (friend?.emailNotifications) {
    sendEmail({
      to: friend.email,
      subject: `${session.user.name} nudged you on Dragger`,
      html: nudgeEmailHtml({
        recipientName: friend.name?.split(" ")[0] || "there",
        senderName: session.user.name || "Someone",
        message: message,
      }),
    }).catch(() => {});
  }

  return NextResponse.json(nudge, { status: 201 });
}
