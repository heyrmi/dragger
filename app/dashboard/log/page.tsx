"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Cigarette, Check } from "lucide-react";

type LogMode = "drag" | "no_change";

export default function LogPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LogMode>("drag");
  const [dragAt, setDragAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/drag-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          dragAt: mode === "drag" ? new Date(dragAt).toISOString() : undefined,
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Hmm, that didn't work. Try again?");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Log an update</h1>
        <p className="mt-1 text-text-secondary">Be honest — that&apos;s the whole point.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("drag")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
            mode === "drag"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-text-secondary hover:border-text-secondary"
          }`}
        >
          <Cigarette size={18} />
          I had a drag
        </button>
        <button
          onClick={() => setMode("no_change")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-sm border px-4 py-3 text-sm font-medium transition-colors ${
            mode === "no_change"
              ? "border-success bg-success/10 text-success"
              : "border-border text-text-secondary hover:border-text-secondary"
          }`}
        >
          <Check size={18} />
          No change
        </button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "drag" && (
            <Input
              id="dragAt"
              label="When did it happen?"
              type="datetime-local"
              value={dragAt}
              onChange={(e) => setDragAt(e.target.value)}
              required
            />
          )}

          {mode === "no_change" && (
            <div className="rounded-sm border border-success/30 bg-success/5 p-4 text-sm text-success">
              No change — still going strong.
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="note" className="text-sm text-text-secondary">
              Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder={
                mode === "drag"
                  ? "What was going on?"
                  : "How are you feeling?"
              }
              className="rounded-sm border border-border bg-bg-primary px-4 py-2.5 text-text-primary placeholder-text-secondary transition-colors focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none"
            />
            <span className="text-xs text-text-secondary text-right">
              {note.length}/280
            </span>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : mode === "drag"
                ? "Log it"
                : "Confirm — no change"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
