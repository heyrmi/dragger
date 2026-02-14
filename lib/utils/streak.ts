interface DragLog {
  type: string;
  dragAt: Date | null;
  createdAt: Date | null;
}

function getDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
}

function getTodayInTimezone(timezone: string): string {
  return getDateInTimezone(new Date(), timezone);
}

export function calculateCurrentStreak(
  logs: DragLog[],
  timezone: string = "UTC"
): { days: number; lastDragAt: Date | null } {
  // Find the most recent 'drag' log
  const dragLogs = logs
    .filter((l) => l.type === "drag" && l.dragAt)
    .sort((a, b) => new Date(b.dragAt!).getTime() - new Date(a.dragAt!).getTime());

  if (dragLogs.length === 0) {
    // Never logged a drag — streak since first log or account creation
    return { days: -1, lastDragAt: null }; // -1 means "no drags ever"
  }

  const lastDragDate = new Date(dragLogs[0].dragAt!);
  const today = getTodayInTimezone(timezone);
  const lastDragDay = getDateInTimezone(lastDragDate, timezone);

  // Calculate days between last drag and today
  const todayMs = new Date(today + "T00:00:00Z").getTime();
  const lastDragMs = new Date(lastDragDay + "T00:00:00Z").getTime();
  const diffDays = Math.floor((todayMs - lastDragMs) / (1000 * 60 * 60 * 24));

  return { days: diffDays, lastDragAt: lastDragDate };
}

export function calculateLongestStreak(
  logs: DragLog[],
  userCreatedAt: Date,
  timezone: string = "UTC"
): number {
  const dragLogs = logs
    .filter((l) => l.type === "drag" && l.dragAt)
    .sort((a, b) => new Date(a.dragAt!).getTime() - new Date(b.dragAt!).getTime());

  if (dragLogs.length === 0) {
    // No drags — streak is from account creation to now
    const today = getTodayInTimezone(timezone);
    const createdDay = getDateInTimezone(userCreatedAt, timezone);
    const todayMs = new Date(today + "T00:00:00Z").getTime();
    const createdMs = new Date(createdDay + "T00:00:00Z").getTime();
    return Math.floor((todayMs - createdMs) / (1000 * 60 * 60 * 24));
  }

  let longestStreak = 0;

  // Check gap from account creation to first drag
  const firstDragDay = getDateInTimezone(new Date(dragLogs[0].dragAt!), timezone);
  const createdDay = getDateInTimezone(userCreatedAt, timezone);
  const firstGap = Math.floor(
    (new Date(firstDragDay + "T00:00:00Z").getTime() -
      new Date(createdDay + "T00:00:00Z").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  longestStreak = Math.max(longestStreak, firstGap);

  // Check gaps between consecutive drags
  for (let i = 1; i < dragLogs.length; i++) {
    const prevDay = getDateInTimezone(new Date(dragLogs[i - 1].dragAt!), timezone);
    const currDay = getDateInTimezone(new Date(dragLogs[i].dragAt!), timezone);
    const gap = Math.floor(
      (new Date(currDay + "T00:00:00Z").getTime() -
        new Date(prevDay + "T00:00:00Z").getTime()) /
        (1000 * 60 * 60 * 24)
    );
    longestStreak = Math.max(longestStreak, gap);
  }

  // Check gap from last drag to now
  const currentStreak = calculateCurrentStreak(logs, timezone);
  if (currentStreak.days > longestStreak) {
    longestStreak = currentStreak.days;
  }

  return longestStreak;
}

export function countNoChangeEntries(logs: DragLog[]): number {
  return logs.filter((l) => l.type === "no_change").length;
}

export function daysSinceJoining(userCreatedAt: Date, timezone: string = "UTC"): number {
  const today = getTodayInTimezone(timezone);
  const createdDay = getDateInTimezone(userCreatedAt, timezone);
  const todayMs = new Date(today + "T00:00:00Z").getTime();
  const createdMs = new Date(createdDay + "T00:00:00Z").getTime();
  return Math.floor((todayMs - createdMs) / (1000 * 60 * 60 * 24));
}
