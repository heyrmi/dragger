import { LeaderboardList } from "@/components/leaderboard/leaderboard-list";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Leaderboard
      </h1>
      <LeaderboardList />
    </div>
  );
}
