"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    router.replace(next);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <img src="/sams-slim-gym-logo.png" alt="Sam's Slim Gym" />
        <p className="auth-eyebrow">SAM&apos;S SLIM GYM</p>
        <h1>Staff sign in</h1>
        <p className="auth-subtitle">Sign in to manage members and gym activity.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}><LogIn size={16} /> {loading ? "Signing in…" : "Sign in"}</button>
        </form>
        <small><LockKeyhole size={13} /> Staff accounts are managed in Supabase Authentication.</small>
      </section>
    </main>
  );
}
