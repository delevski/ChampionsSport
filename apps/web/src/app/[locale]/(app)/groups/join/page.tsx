"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@championsport/supabase";

export default function JoinGroupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await rpc.joinGroupByCode(supabase, {
      p_code: code.trim().toUpperCase(),
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(`/he/groups/${data}`);
  }

  return (
    <div className="space-y-6">
      <Link href="/he/groups" className="text-sm text-accent">
        חזרה
      </Link>
      <h1 className="text-xl font-bold">הצטרף לקבוצה</h1>
      <form onSubmit={handleJoin} className="space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="קוד הזמנה"
          maxLength={8}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-center font-mono text-lg tracking-widest"
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 font-bold text-background"
        >
          {loading ? "מצטרף..." : "הצטרף"}
        </button>
      </form>
    </div>
  );
}
