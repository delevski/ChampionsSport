import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Team = { name: string; name_he?: string | null; logo_url?: string | null };
type Match = {
  id: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  kickoff_at: string;
  home_team: Team;
  away_team: Team;
};

export function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <Link
      href={`/he/match/${match.id}`}
      className="block rounded-xl border border-border bg-surface p-4 transition hover:border-accent/50"
    >
      <div className="mb-3 flex items-center justify-between text-xs">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium",
            isLive && "bg-live/20 text-live animate-pulse",
            isFinished && "text-muted",
            !isLive && !isFinished && "text-accent"
          )}
        >
          {isLive ? "שידור חי" : isFinished ? "הסתיים" : "קרוב"}
        </span>
        <span className="text-muted">
          {new Date(match.kickoff_at).toLocaleString("he-IL", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <TeamSide team={match.home_team} />
        <div className="text-center font-mono text-xl font-bold">
          {isFinished || isLive ? (
            <span>
              {match.home_score ?? 0} : {match.away_score ?? 0}
            </span>
          ) : (
            <span className="text-muted text-sm">VS</span>
          )}
        </div>
        <TeamSide team={match.away_team} align="end" />
      </div>
    </Link>
  );
}

function TeamSide({
  team,
  align = "start",
}: {
  team: Team;
  align?: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-1",
        align === "end" ? "items-end text-left" : "items-start"
      )}
    >
      {team.logo_url && (
        <Image
          src={team.logo_url}
          alt={team.name}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      )}
      <span className="text-sm font-medium">{team.name_he ?? team.name}</span>
    </div>
  );
}
