import { getServerSession } from "@/lib/session";
import { getUserStats } from "@/lib/queries/stats";
import { StreakHero } from "@/components/dashboard/streak-hero";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PersonalStats } from "@/components/dashboard/personal-stats";
import { FriendFeed } from "@/components/dashboard/friend-feed";
import { PendingNudges } from "@/components/dashboard/pending-nudges";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return null;

  const stats = await getUserStats(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          How&apos;s it going, {session.user.name?.split(" ")[0]}?
        </h1>
      </div>

      <PendingNudges />

      {stats ? (
        <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-8">
            <StreakHero
              streakDays={stats.currentStreak}
              lastDragAt={stats.lastDragAt?.toISOString() ?? null}
              neverDragged={stats.neverDragged}
            />

            <QuickActions />

            <PersonalStats
              longestStreak={stats.longestStreak}
              noChangeCount={stats.noChangeCount}
              daysOnDragger={stats.daysOnDragger}
            />
          </div>

          <div>
            <FriendFeed />
          </div>
        </div>
      ) : (
        <div className="text-text-secondary">Loading your stats...</div>
      )}
    </div>
  );
}
