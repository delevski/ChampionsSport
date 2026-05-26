"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Database } from "@championsport/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ProfileClient({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string;
}) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/he/login");
    router.refresh();
  }

  const rankBadge =
    profile?.global_rank && profile.global_rank <= 10
      ? "🏆 Top 10"
      : profile?.global_rank && profile.global_rank <= 100
        ? "⭐ Top 100"
        : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-3xl font-bold text-accent">
          {(profile?.username ?? email)[0]?.toUpperCase()}
        </div>
        <h1 className="text-xl font-bold">{profile?.username ?? "שחקן"}</h1>
        <p className="text-sm text-muted">{email}</p>
        {rankBadge && (
          <span className="mt-2 inline-block rounded-full bg-accent-gold/20 px-3 py-1 text-sm text-accent-gold">
            {rankBadge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="נקודות" value={profile?.total_points ?? 0} />
        <StatCard label="דירוג" value={profile?.global_rank ?? "-"} />
        <StatCard label="מדויקים" value={profile?.exact_predictions ?? 0} />
        <StatCard label="רצף מדויק" value={profile?.exact_streak ?? 0} />
        <StatCard label="ניחושים" value={profile?.total_predictions ?? 0} />
        <StatCard label="טעויות" value={profile?.failed_predictions ?? 0} />
      </div>

      <button
        onClick={logout}
        className="w-full rounded-xl border border-danger py-3 text-danger"
      >
        התנתקות
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-center">
      <p className="text-2xl font-bold text-accent">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
