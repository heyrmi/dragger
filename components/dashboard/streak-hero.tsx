"use client";

import { useEffect, useState } from "react";

interface StreakHeroProps {
  streakDays: number;
  lastDragAt: string | null;
  neverDragged: boolean;
}

export function StreakHero({ streakDays, lastDragAt, neverDragged }: StreakHeroProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (streakDays === 0) {
      setDisplayCount(0);
      return;
    }

    const duration = 1000;
    const start = performance.now();
    const target = streakDays;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [streakDays]);

  const subtitle = neverDragged
    ? "clean since you joined"
    : streakDays === 0
      ? "fresh start"
      : "since your last drag";

  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <div className="font-mono text-7xl font-bold tracking-tight sm:text-8xl text-text-primary">
        {displayCount}
      </div>
      <div className="text-lg text-text-secondary">
        {streakDays === 0 && !neverDragged ? (
          <span>Day 0 — {subtitle}</span>
        ) : (
          <span>
            {displayCount === 1 ? "day" : "days"} {subtitle}
          </span>
        )}
      </div>
      {lastDragAt && (
        <div className="mt-1 font-mono text-xs text-text-secondary">
          Last drag:{" "}
          {new Date(lastDragAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}
