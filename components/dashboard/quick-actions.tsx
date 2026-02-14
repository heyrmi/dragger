"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Cigarette, Check } from "lucide-react";
import { useState } from "react";

export function QuickActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleNoChange() {
    setLoading("no_change");
    try {
      const res = await fetch("/api/drag-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "no_change" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="primary"
        className="flex-1 gap-2"
        onClick={() => router.push("/dashboard/log")}
      >
        <Cigarette size={18} />
        I had a drag
      </Button>
      <Button
        variant="secondary"
        className="flex-1 gap-2"
        onClick={handleNoChange}
        disabled={loading === "no_change"}
      >
        <Check size={18} />
        {loading === "no_change" ? "Saving..." : "No change"}
      </Button>
    </div>
  );
}
