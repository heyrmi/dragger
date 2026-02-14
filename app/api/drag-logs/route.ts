import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dragLogs } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, dragAt, note } = body;

  if (!type || !["drag", "no_change"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (type === "drag") {
    if (!dragAt) {
      return NextResponse.json({ error: "dragAt is required for drag type" }, { status: 400 });
    }
    const dragDate = new Date(dragAt);
    if (dragDate > new Date()) {
      return NextResponse.json({ error: "dragAt cannot be in the future" }, { status: 400 });
    }
    if (session.user.createdAt && dragDate < new Date(session.user.createdAt)) {
      return NextResponse.json({ error: "dragAt cannot be before account creation" }, { status: 400 });
    }
  }

  if (note && note.length > 280) {
    return NextResponse.json({ error: "Note too long (max 280 chars)" }, { status: 400 });
  }

  // Rate limit: max 10 logs per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentLogs = await db
    .select()
    .from(dragLogs)
    .where(and(eq(dragLogs.userId, session.user.id), gte(dragLogs.createdAt, oneHourAgo)));

  if (recentLogs.length >= 10) {
    return NextResponse.json({ error: "Too many logs. Try again later." }, { status: 429 });
  }

  const [log] = await db
    .insert(dragLogs)
    .values({
      userId: session.user.id,
      type,
      dragAt: type === "drag" ? new Date(dragAt) : null,
      note: note || null,
    })
    .returning();

  return NextResponse.json(log, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  const logs = await db
    .select()
    .from(dragLogs)
    .where(eq(dragLogs.userId, session.user.id))
    .orderBy(desc(dragLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(logs);
}
