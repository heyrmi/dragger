import { db } from "@/lib/db";
import { users, friendships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function handlePostSignupInvite(newUserId: string, inviteCode: string) {
  // Find the inviter
  const [inviter] = await db
    .select()
    .from(users)
    .where(eq(users.inviteCode, inviteCode))
    .limit(1);

  if (!inviter) return;

  // Auto-create accepted friendship
  await db.insert(friendships).values({
    requesterId: inviter.id,
    addresseeId: newUserId,
    status: "accepted",
  });
}
