"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export function FriendSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  async function handleSearch() {
    if (query.length < 2) return;
    setSearching(true);
    const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setSearching(false);
  }

  async function handleSendRequest(userId: string) {
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok || res.status === 409) {
      setSentIds((prev) => new Set(prev).add(userId));
    }
  }

  return (
    <Card>
      <h3 className="font-heading text-lg font-bold mb-3">Find friends</h3>
      <div className="flex gap-2 mb-4">
        <Input
          id="search"
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button
          variant="secondary"
          onClick={handleSearch}
          disabled={searching || query.length < 2}
          className="px-3"
        >
          <Search size={16} />
        </Button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-sm border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface text-xs font-bold text-text-secondary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {user.name}
                  </div>
                  <div className="text-xs text-text-secondary">{user.email}</div>
                </div>
              </div>
              <Button
                variant={sentIds.has(user.id) ? "ghost" : "secondary"}
                className="px-3 py-1.5 text-sm"
                disabled={sentIds.has(user.id)}
                onClick={() => handleSendRequest(user.id)}
              >
                {sentIds.has(user.id) ? (
                  "Sent"
                ) : (
                  <>
                    <UserPlus size={14} className="mr-1" /> Add
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
