import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { getUserStats } from "@/lib/queries/stats";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getUserStats(session.user.id);
  if (!stats) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(stats);
}
