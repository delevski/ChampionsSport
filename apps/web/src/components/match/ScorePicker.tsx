"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  homeScore: number;
  awayScore: number;
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
};

function ScoreControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground disabled:opacity-40"
      >
        <Minus size={18} />
      </button>
      <span className="w-8 text-center font-mono text-3xl font-bold">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= 20}
        onClick={() => onChange(Math.min(20, value + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-background disabled:opacity-40"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

export function ScorePicker({ homeScore, awayScore, onChange, disabled }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-8 rounded-xl border border-border bg-surface-elevated p-6",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <ScoreControl
        value={homeScore}
        onChange={(h) => onChange(h, awayScore)}
        disabled={disabled}
      />
      <span className="text-2xl font-bold text-muted">:</span>
      <ScoreControl
        value={awayScore}
        onChange={(a) => onChange(homeScore, a)}
        disabled={disabled}
      />
    </div>
  );
}
