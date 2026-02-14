"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="font-heading text-xl font-bold">
        Hmm, something went wrong
      </h2>
      <p className="text-text-secondary">
        Don&apos;t worry, your data is safe. Try again?
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
