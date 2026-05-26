"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/he/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent">ChampionsSport</h1>
          <p className="mt-1 text-muted">הרשמה</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
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
            placeholder="סיסמה (לפחות 6 תווים)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-accent"
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 font-bold text-background disabled:opacity-50"
          >
            {loading ? "טוען..." : "הירשם"}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          כבר יש לך חשבון?{" "}
          <Link href="/he/login" className="text-accent">
            התחברות
          </Link>
        </p>
      </div>
    </div>
  );
}
