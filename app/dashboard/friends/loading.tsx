import { Skeleton } from "@/components/ui/skeleton";

export default function FriendsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-32" />
    </div>
  );
}
