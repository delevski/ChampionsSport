import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { GroupsClient } from "./GroupsClient";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membershipsRaw } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user.id);

  const memberships = (membershipsRaw ?? []) as {
    group_id: string;
    role: string;
  }[];

  const groupIds = memberships.map((m) => m.group_id);
  const { data: groupsRaw } = groupIds.length
    ? await supabase.from("groups").select("id, name, invite_code, is_locked").in("id", groupIds)
    : { data: [] };

  const groupMap = new Map(
    ((groupsRaw ?? []) as { id: string; name: string; invite_code: string; is_locked: boolean }[]).map(
      (g) => [g.id, g]
    )
  );

  const groups = memberships
    .map((m) => {
      const g = groupMap.get(m.group_id);
      if (!g) return null;
      return { ...g, role: m.role };
    })
    .filter(Boolean) as {
    id: string;
    name: string;
    invite_code: string;
    is_locked: boolean;
    role: string;
  }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">הקבוצות שלי</h1>
        <Link href="/he/groups/join" className="text-sm text-accent">
          הצטרף
        </Link>
      </div>
      <GroupsClient initialGroups={groups} />
    </div>
  );
}
