import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { or, ilike, ne, and } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(
      and(
        ne(users.id, session.user.id),
        or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))
      )
    )
    .limit(10);

  return NextResponse.json(results);
}
