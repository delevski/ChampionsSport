import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/match/MatchCard";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import Link from "next/link";
import type { Database } from "@championsport/supabase";

type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
type LeaderboardRow = Database["public"]["Views"]["global_leaderboard"]["Row"];

type MatchWithTeams = MatchRow & {
  home_team: TeamRow;
  away_team: TeamRow;
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: matchesRaw } = await supabase
    .from("matches")
    .select("*")
    .in("status", ["scheduled", "live"])
    .order("kickoff_at", { ascending: true })
    .limit(5);

  const matchesList = (matchesRaw ?? []) as MatchRow[];
  const teamIds = [
    ...new Set(matchesList.flatMap((m) => [m.home_team_id, m.away_team_id])),
  ];

  const { data: teamsRaw } = teamIds.length
    ? await supabase.from("teams").select("*").in("id", teamIds)
    : { data: [] };

  const teamMap = new Map(
    ((teamsRaw ?? []) as TeamRow[]).map((t) => [t.id, t])
  );

  const matches: MatchWithTeams[] = matchesList
    .map((m) => ({
      ...m,
      home_team: teamMap.get(m.home_team_id)!,
      away_team: teamMap.get(m.away_team_id)!,
    }))
    .filter((m) => m.home_team && m.away_team);

  const supabaseAny = supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        order: (
          col: string,
          opts: { ascending: boolean }
        ) => {
          limit: (n: number) => Promise<{ data: LeaderboardRow[] | null }>;
        };
      };
    };
  };

  const { data: leaderboard } = await supabaseAny
    .from("global_leaderboard")
    .select("*")
    .order("rank", { ascending: true })
    .limit(5);

  const { data: activityRaw } = await supabase
    .from("activity_feed")
    .select("id, type, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const activity = (activityRaw ?? []) as {
    id: string;
    type: string;
    user_id: string;
  }[];

  const userIds = [...new Set(activity.map((a) => a.user_id))];
  const { data: actProfiles } = userIds.length
    ? await supabase.from("profiles").select("id, username").in("id", userIds)
    : { data: [] };

  const actProfileMap = new Map(
    ((actProfiles ?? []) as { id: string; username: string | null }[]).map(
      (p) => [p.id, p.username]
    )
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">משחקים קרובים</h2>
          <Link href="/he/tournament" className="text-sm text-accent">
            הכל
          </Link>
        </div>
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
          {matches.length === 0 && (
            <p className="text-muted text-sm">אין משחקים קרובים</p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">דירוג</h2>
          <Link href="/he/leaderboard" className="text-sm text-accent">
            דירוג מלא
          </Link>
        </div>
        <LeaderboardTable rows={(leaderboard ?? []) as never} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">פעילות אחרונה</h2>
        <div className="space-y-2">
          {activity.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {actProfileMap.get(a.user_id) ?? "שחקן"}
              </span>{" "}
              — {a.type}
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-muted text-sm">אין פעילות</p>
          )}
        </div>
      </section>
    </div>
  );
}
