"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserMinus, Bell } from "lucide-react";
import { useState } from "react";

interface FriendCardProps {
  friendshipId: string;
  name: string;
  image: string | null;
  currentStreak: number;
  friendId: string;
  onRemove: (friendshipId: string) => void;
}

export function FriendCard({
  friendshipId,
  name,
  currentStreak,
  friendId,
  onRemove,
}: FriendCardProps) {
  const [nudging, setNudging] = useState(false);
  const [nudged, setNudged] = useState(false);

  async function handleNudge() {
    setNudging(true);
    const res = await fetch("/api/friends/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    });
    setNudging(false);
    if (res.ok) setNudged(true);
  }

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface text-sm font-bold text-text-secondary">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-text-primary">{name}</div>
          <div className="font-mono text-sm text-success">
            {currentStreak}d streak
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="p-2"
          onClick={handleNudge}
          disabled={nudging || nudged}
          title="Nudge"
        >
          <Bell size={16} className={nudged ? "text-accent-secondary" : ""} />
        </Button>
        <Button
          variant="ghost"
          className="p-2"
          onClick={() => onRemove(friendshipId)}
          title="Remove friend"
        >
          <UserMinus size={16} />
        </Button>
      </div>
    </Card>
  );
}
