"use client";

import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

export function CountdownBadge({ lockAt }: { lockAt: string }) {
  const { locked, formatted } = useCountdown(lockAt);

  if (locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger/20 px-3 py-1 text-sm text-danger">
        הניחושים נסגרו
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-sm text-accent">
      <Clock size={14} />
      נסגר בעוד {formatted}
    </span>
  );
}
