"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usernameSchema } from "@championsport/shared";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "שם משתמש לא תקין");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/he/login");
      return;
    }
    const { error: err } = await supabase
      .from("profiles")
      .update({ username: parsed.data })
      .eq("id", user.id);
    setLoading(false);
    if (err) {
      setError(err.message.includes("unique") ? "שם המשתמש תפוס" : err.message);
      return;
    }
    router.push("/he");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">בחר שם משתמש</h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="שם משתמש"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3"
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 font-bold text-background"
        >
          המשך
        </button>
      </form>
    </div>
  );
}
