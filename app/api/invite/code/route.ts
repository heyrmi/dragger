import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({ inviteCode: users.inviteCode })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.inviteCode) {
    return NextResponse.json({ error: "No invite code" }, { status: 404 });
  }

  return NextResponse.json({ inviteCode: user.inviteCode });
}
