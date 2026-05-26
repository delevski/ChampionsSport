"use client";

import { useEffect, useState } from "react";
import { isPredictionLocked } from "@championsport/shared";

export function useCountdown(lockAt: string | Date) {
  const target = new Date(lockAt);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locked = isPredictionLocked(target, now);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const formatted =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;

  return { locked, formatted, diff };
}
