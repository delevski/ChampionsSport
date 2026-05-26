import Image from "next/image";

type Row = {
  rank: number;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  total_points: number;
  exact_predictions: number;
};

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-muted">אין נתונים עדיין</p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.user_id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              row.rank <= 3 ? "bg-accent-gold/20 text-accent-gold" : "bg-surface-elevated text-muted"
            }`}
          >
            {row.rank}
          </span>
          {row.avatar_url ? (
            <Image
              src={row.avatar_url}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-sm">
              {(row.username ?? "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium">{row.username ?? "שחקן"}</p>
            <p className="text-xs text-muted">{row.exact_predictions} מדויקים</p>
          </div>
          <span className="font-mono text-lg font-bold text-accent">
            {row.total_points}
          </span>
        </div>
      ))}
    </div>
  );
}
