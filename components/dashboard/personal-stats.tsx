import { Card } from "@/components/ui/card";

interface PersonalStatsProps {
  longestStreak: number;
  noChangeCount: number;
  daysOnDragger: number;
}

export function PersonalStats({
  longestStreak,
  noChangeCount,
  daysOnDragger,
}: PersonalStatsProps) {
  const stats = [
    { label: "Longest streak", value: `${longestStreak}d` },
    { label: "No-change logs", value: noChangeCount },
    { label: "Days on Dragger", value: daysOnDragger },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex flex-col items-center gap-1 p-4">
          <span className="font-mono text-2xl font-bold text-text-primary">
            {stat.value}
          </span>
          <span className="text-xs text-text-secondary text-center">
            {stat.label}
          </span>
        </Card>
      ))}
    </div>
  );
}
