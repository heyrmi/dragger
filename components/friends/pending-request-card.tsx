"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PendingRequestCardProps {
  friendshipId: string;
  name: string;
  image: string | null;
  onRespond: (friendshipId: string, action: "accept" | "decline") => void;
}

export function PendingRequestCard({
  friendshipId,
  name,
  onRespond,
}: PendingRequestCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface text-sm font-bold text-text-secondary">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="font-medium text-text-primary">{name}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          className="px-3 py-1.5 text-sm"
          onClick={() => onRespond(friendshipId, "accept")}
        >
          Accept
        </Button>
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-sm"
          onClick={() => onRespond(friendshipId, "decline")}
        >
          Decline
        </Button>
      </div>
    </Card>
  );
}
