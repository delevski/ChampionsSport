import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import Link from "next/link";
import { GroupAdminActions } from "./GroupAdminActions";
import type { Database } from "@championsport/supabase";

type Group = Database["public"]["Tables"]["groups"]["Row"];
type LeaderboardRow = Database["public"]["Views"]["group_leaderboard"]["Row"];

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: groupData } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  const group = groupData as Group | null;
  if (!group) notFound();

  const { data: membersRaw } = await supabase
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", id);

  const memberIds = ((membersRaw ?? []) as { user_id: string; role: string }[]).map(
    (m) => m.user_id
  );

  const { data: profilesRaw } = memberIds.length
    ? await supabase.from("profiles").select("id, username").in("id", memberIds)
    : { data: [] };

  const profileMap = new Map(
    ((profilesRaw ?? []) as { id: string; username: string | null }[]).map((p) => [
      p.id,
      p.username,
    ])
  );

  const members = ((membersRaw ?? []) as { user_id: string; role: string }[]).map(
    (m) => ({
      ...m,
      username: profileMap.get(m.user_id) ?? "שחקן",
    })
  );

  const supabaseAny = supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: LeaderboardRow[] | null;
          }>;
        };
      };
    };
  };

  const { data: leaderboard } = await supabaseAny
    .from("group_leaderboard")
    .select("*")
    .eq("group_id", id)
    .order("rank", { ascending: true });

  const { data: activityRaw } = await supabase
    .from("activity_feed")
    .select("id, type, user_id, created_at")
    .eq("group_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const activity = (activityRaw ?? []) as {
    id: string;
    type: string;
    user_id: string;
    created_at: string;
  }[];

  const isAdmin = user?.id === group.admin_id;

  return (
    <div className="space-y-6">
      <Link href="/he/groups" className="text-sm text-accent">
        חזרה
      </Link>
      <div>
        <h1 className="text-xl font-bold">{group.name}</h1>
        <p className="text-sm text-muted">קוד: {group.invite_code}</p>
      </div>

      {isAdmin && <GroupAdminActions groupId={id} />}

      <section>
        <h2 className="mb-3 font-bold">לוח מובילים</h2>
        <LeaderboardTable rows={(leaderboard ?? []) as never} />
      </section>

      <section>
        <h2 className="mb-3 font-bold">חברים ({members.length})</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
            >
              <span>{m.username}</span>
              {m.role === "admin" && (
                <span className="text-xs text-accent-gold">מנהל</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-bold">פעילות</h2>
        <div className="space-y-2">
          {activity.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              {profileMap.get(a.user_id) ?? "שחקן"} — {a.type}
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
