"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { timeAgo } from "@/lib/utils/time-ago";

interface Nudge {
  id: string;
  message: string;
  createdAt: string;
  fromUserName: string;
  fromUserImage: string | null;
  fromUserId: string;
}

export function PendingNudges() {
  const [nudges, setNudges] = useState<Nudge[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : []))
      .then(setNudges);
  }, []);

  async function dismissNudge(nudgeId: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nudgeId }),
    });
    setNudges((prev) => prev.filter((n) => n.id !== nudgeId));
  }

  if (nudges.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className="flex items-center justify-between rounded-sm border border-accent-secondary/30 bg-accent-secondary/5 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-accent-secondary">
              {nudge.fromUserName}
            </span>
            <span className="text-text-secondary">nudged you to update!</span>
            <span className="font-mono text-xs text-text-secondary">
              {timeAgo(nudge.createdAt)}
            </span>
          </div>
          <button
            onClick={() => dismissNudge(nudge.id)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
