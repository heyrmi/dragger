interface RankingRowProps {
  rank: number;
  name: string;
  image: string | null;
  streak: number;
  isCurrentUser: boolean;
}

export function RankingRow({ rank, name, streak, isCurrentUser }: RankingRowProps) {
  const rankStyles =
    rank === 1
      ? "text-accent-secondary"
      : rank === 2
        ? "text-text-primary"
        : rank === 3
          ? "text-accent"
          : "text-text-secondary";

  return (
    <div
      className={`flex items-center gap-4 rounded-sm border p-4 ${
        isCurrentUser
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-bg-card"
      }`}
    >
      <span className={`font-mono text-xl font-bold w-8 ${rankStyles}`}>
        #{rank}
      </span>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface text-sm font-bold text-text-secondary shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <span className="font-medium text-text-primary">
          {name}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-accent">(you)</span>
          )}
        </span>
      </div>
      <div className="font-mono text-2xl font-bold text-success">
        {streak}
        <span className="text-sm text-text-secondary ml-1">d</span>
      </div>
    </div>
  );
}
