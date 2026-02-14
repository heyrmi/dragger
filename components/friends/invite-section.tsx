"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Share2 } from "lucide-react";

interface InviteSectionProps {
  inviteCode: string;
}

export function InviteSection({ inviteCode }: InviteSectionProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${inviteCode}`
      : `/invite/${inviteCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on Dragger",
        text: "Let's quit together. Track your streak with me on Dragger.",
        url: inviteUrl,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <Card>
      <h3 className="font-heading text-lg font-bold mb-3">Invite a friend</h3>
      <p className="text-sm text-text-secondary mb-4">
        Share your invite link. They&apos;ll be added as your friend automatically.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 rounded-sm border border-border bg-bg-primary px-3 py-2 font-mono text-xs text-text-secondary truncate">
          {inviteUrl}
        </div>
        <Button variant="secondary" className="px-3" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
        <Button variant="secondary" className="px-3" onClick={handleShare}>
          <Share2 size={16} />
        </Button>
      </div>
    </Card>
  );
}
