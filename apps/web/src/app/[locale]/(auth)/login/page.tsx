"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/he");
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent">ChampionsSport</h1>
          <p className="mt-1 text-muted">התחברות</p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-xl border border-border bg-surface py-3 font-medium transition hover:border-accent"
        >
          המשך עם Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted">או</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
            required
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 font-bold text-background disabled:opacity-50"
          >
            {loading ? "טוען..." : "התחבר"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          אין לך חשבון?{" "}
          <Link href="/he/register" className="text-accent">
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  );
}
