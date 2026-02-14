"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { FriendCard } from "@/components/friends/friend-card";
import { PendingRequestCard } from "@/components/friends/pending-request-card";
import { SentRequestCard } from "@/components/friends/sent-request-card";
import { InviteSection } from "@/components/friends/invite-section";
import { FriendSearch } from "@/components/friends/friend-search";

interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  image: string | null;
  currentStreak: number;
}

interface PendingRequest {
  friendshipId: string;
  id: string;
  name: string;
  image: string | null;
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [sent, setSent] = useState<PendingRequest[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    const res = await fetch("/api/friends");
    if (res.ok) {
      const data = await res.json();
      setFriends(data.friends || []);
      setPending(data.pending || []);
      setSent(data.sent || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/settings/current")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      // Fetch invite code from user data
      fetch(`/api/invite/code`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.inviteCode) setInviteCode(data.inviteCode);
        })
        .catch(() => {});
    }
  }, [session]);

  async function handleRespond(friendshipId: string, action: "accept" | "decline") {
    await fetch("/api/friends/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, action }),
    });
    fetchFriends();
  }

  async function handleRemove(friendshipId: string) {
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
    fetchFriends();
  }

  async function handleCancelSent(friendshipId: string) {
    await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
    fetchFriends();
  }

  if (loading) {
    return <div className="text-text-secondary">Loading friends...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Friends</h1>

      {pending.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-bold mb-3">
            Pending requests ({pending.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((req) => (
              <PendingRequestCard
                key={req.friendshipId}
                friendshipId={req.friendshipId}
                name={req.name}
                image={req.image}
                onRespond={handleRespond}
              />
            ))}
          </div>
        </section>
      )}

      {sent.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-bold mb-3">
            Sent requests ({sent.length})
          </h2>
          <div className="flex flex-col gap-2">
            {sent.map((req) => (
              <SentRequestCard
                key={req.friendshipId}
                friendshipId={req.friendshipId}
                name={req.name}
                image={req.image}
                onCancel={handleCancelSent}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-heading text-lg font-bold mb-3">
          Your friends {friends.length > 0 && `(${friends.length})`}
        </h2>
        {friends.length > 0 ? (
          <div className="flex flex-col gap-2">
            {friends.map((friend) => (
              <FriendCard
                key={friend.friendshipId}
                friendshipId={friend.friendshipId}
                name={friend.name}
                image={friend.image}
                currentStreak={friend.currentStreak}
                friendId={friend.id}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-border bg-bg-card p-6 text-center text-text-secondary">
            No friends yet. Invite someone or search below.
          </div>
        )}
      </section>

      {inviteCode && <InviteSection inviteCode={inviteCode} />}

      <FriendSearch />
    </div>
  );
}
