import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, dragLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { reminderEmailHtml } from "@/lib/email-templates/reminder";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await db.select().from(users);
  let sentCount = 0;

  for (const user of allUsers) {
    if (!user.emailNotifications) continue;

    // Get most recent log
    const [lastLog] = await db
      .select()
      .from(dragLogs)
      .where(eq(dragLogs.userId, user.id))
      .orderBy(desc(dragLogs.createdAt))
      .limit(1);

    const lastUpdate = lastLog?.createdAt || user.createdAt;
    if (!lastUpdate) continue;

    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const interval = user.reminderIntervalDays || 3;
    if (daysSinceUpdate < interval) continue;

    // Debounce: don't send if we already sent within 24 hours
    if (user.lastReminderSentAt) {
      const hoursSinceReminder =
        (Date.now() - new Date(user.lastReminderSentAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceReminder < 24) continue;
    }

    // Send reminder
    await sendEmail({
      to: user.email,
      subject: `How's it going, ${user.name?.split(" ")[0] || "friend"}?`,
      html: reminderEmailHtml({
        name: user.name?.split(" ")[0] || "there",
        daysSinceUpdate,
      }),
    });

    // Update last reminder sent timestamp
    await db
      .update(users)
      .set({ lastReminderSentAt: new Date() })
      .where(eq(users.id, user.id));

    sentCount++;
  }

  return NextResponse.json({ sent: sentCount });
}
