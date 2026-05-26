"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@championsport/supabase";

export function GroupAdminActions({ groupId }: { groupId: string }) {
  const router = useRouter();

  async function deleteGroup() {
    if (!confirm("למחוק את הקבוצה?")) return;
    const supabase = createClient();
    await rpc.deleteGroup(supabase, { p_group_id: groupId });
    router.push("/he/groups");
    router.refresh();
  }

  return (
    <button
      onClick={deleteGroup}
      className="text-sm text-danger"
    >
      מחק קבוצה
    </button>
  );
}
