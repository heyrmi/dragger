"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface SentRequestCardProps {
  friendshipId: string;
  name: string;
  image: string | null;
  onCancel: (friendshipId: string) => void;
}

export function SentRequestCard({
  friendshipId,
  name,
  onCancel,
}: SentRequestCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface text-sm font-bold text-text-secondary">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-text-primary">{name}</div>
          <div className="text-xs text-text-secondary">Pending</div>
        </div>
      </div>
      <Button
        variant="ghost"
        className="p-2"
        onClick={() => onCancel(friendshipId)}
      >
        <X size={16} />
      </Button>
    </Card>
  );
}
