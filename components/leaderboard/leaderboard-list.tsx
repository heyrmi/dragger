"use client";

import { useState, useEffect } from "react";
import { RankingRow } from "./ranking-row";

interface Ranking {
  id: string;
  name: string;
  image: string | null;
  currentStreak: number;
  longestStreak: number;
  isCurrentUser: boolean;
}

type SortMode = "current" | "longest";

export function LeaderboardList() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("current");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRankings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-text-secondary">Loading leaderboard...</div>;
  }

  const sorted = [...rankings].sort((a, b) =>
    sortMode === "current"
      ? b.currentStreak - a.currentStreak
      : b.longestStreak - a.longestStreak
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSortMode("current")}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
            sortMode === "current"
              ? "bg-accent text-white"
              : "border border-border text-text-secondary hover:text-text-primary"
          }`}
        >
          Current streak
        </button>
        <button
          onClick={() => setSortMode("longest")}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
            sortMode === "longest"
              ? "bg-accent text-white"
              : "border border-border text-text-secondary hover:text-text-primary"
          }`}
        >
          Longest streak
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-sm border border-border bg-bg-card p-6 text-center text-text-secondary">
          Invite more friends for a real competition.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((ranking, i) => (
            <RankingRow
              key={ranking.id}
              rank={i + 1}
              name={ranking.name}
              image={ranking.image}
              streak={
                sortMode === "current"
                  ? ranking.currentStreak
                  : ranking.longestStreak
              }
              isCurrentUser={ranking.isCurrentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
