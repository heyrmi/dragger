"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils/time-ago";
import { Cigarette, Check } from "lucide-react";

interface FeedItem {
  id: string;
  type: string;
  dragAt: string | null;
  note: string | null;
  createdAt: string;
  userName: string;
  userImage: string | null;
  userId: string;
}

export function FriendFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/friends/feed")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="text-center text-text-secondary">
        Loading activity...
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="text-center text-text-secondary">
        <p>It&apos;s quiet here. Invite a friend to start your accountability circle.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-heading text-lg font-bold">Friend activity</h2>
      {items.map((item) => (
        <Card key={item.id} className="flex items-start gap-3 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface text-xs font-bold text-text-secondary shrink-0">
            {item.userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-sm">
                {item.userName}
              </span>
              <span className="font-mono text-xs text-text-secondary">
                {timeAgo(item.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-text-secondary mt-0.5">
              {item.type === "drag" ? (
                <>
                  <Cigarette size={14} className="text-accent" />
                  <span>logged a drag</span>
                </>
              ) : (
                <>
                  <Check size={14} className="text-success" />
                  <span>confirmed no change</span>
                </>
              )}
            </div>
            {item.note && (
              <p className="mt-1 text-sm text-text-secondary italic">
                &ldquo;{item.note}&rdquo;
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
