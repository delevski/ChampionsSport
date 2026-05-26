"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@championsport/supabase";

type Group = {
  id: string;
  name: string;
  invite_code: string;
  is_locked: boolean;
  role: string;
};

export function GroupsClient({ initialGroups }: { initialGroups: Group[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createGroup() {
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await rpc.createGroup(supabase, {
      p_name: name.trim(),
    });
    setCreating(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(`/he/groups/${data}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-2 font-medium">צור קבוצה חדשה</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם הקבוצה"
            className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2"
          />
          <button
            onClick={createGroup}
            disabled={creating}
            className="rounded-lg bg-accent px-4 py-2 font-medium text-background"
          >
            צור
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      <div className="space-y-2">
        {initialGroups.map((g) => (
          <Link
            key={g.id}
            href={`/he/groups/${g.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div>
              <p className="font-medium">{g.name}</p>
              <p className="text-xs text-muted">קוד: {g.invite_code}</p>
            </div>
            {g.role === "admin" && (
              <span className="text-xs text-accent-gold">מנהל</span>
            )}
          </Link>
        ))}
        {initialGroups.length === 0 && (
          <p className="text-center text-muted text-sm">אין קבוצות עדיין</p>
        )}
      </div>
    </div>
  );
}
