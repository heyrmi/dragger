import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nudges } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { nudgeId } = await request.json();

  if (nudgeId) {
    // Mark specific nudge as read
    await db
      .update(nudges)
      .set({ readAt: new Date() })
      .where(and(eq(nudges.id, nudgeId), eq(nudges.toUserId, session.user.id)));
  } else {
    // Mark all as read
    await db
      .update(nudges)
      .set({ readAt: new Date() })
      .where(eq(nudges.toUserId, session.user.id));
  }

  return NextResponse.json({ success: true });
}
