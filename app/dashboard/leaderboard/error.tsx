"use client";

import { Button } from "@/components/ui/button";

export default function LeaderboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="font-heading text-xl font-bold">
        Leaderboard took a break
      </h2>
      <p className="text-text-secondary">Try again?</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
