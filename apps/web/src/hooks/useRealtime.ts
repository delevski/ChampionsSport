"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeSubscription(
  table: "matches" | "predictions" | "activity_feed" | "profiles",
  filter: string | undefined,
  onUpdate: () => void
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}-${filter ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onUpdate]);
}
