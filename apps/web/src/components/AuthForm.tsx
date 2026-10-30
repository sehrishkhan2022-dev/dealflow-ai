"use client";
import { useHydrated } from "@/lib/useHydrated";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, Identity } from "@/lib/api";
export default function AuthForm({ register = false }: { register?: boolean }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      const me: Identity = await api("/me");
      router.push(
        me.workspaces.length
          ? `/app/${me.workspaces[0].id}/overview`
          : "/onboarding",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <aside>
        <Link className="brand" href="/">
          ◈ DealFlow AI
        </Link>
        <div>
          <span className="eyebrow">LESS CHASING. MORE CONNECTING.</span>
          <h1>
            Make room for
            <br />
            your next
            <br />
            <em>good conversation.</em>
          </h1>
          <p>A little clarity goes a long way.</p>
        </div>
        <small>Built around your team. Guided by you.</small>
      </aside>
      <section>
        <form method="post" onSubmit={submit}>
          <span className="eyebrow">YOUR WORKSPACE AWAITS</span>
          <h1>{register ? "Start something good." : "Welcome back."}</h1>
          <p>
            {register
              ? "Create your account to get started."
              : "Let’s pick up where you left off."}
          </p>
          {register && (
            <label>
              Full name
              <input name="name" autoComplete="name" required maxLength={120} />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={12}
              required
            />
          </label>
          {register && (
            <small className="muted">
              Use at least 12 characters, including letters and numbers.
            </small>
          )}
          {register && (
            <label>
              Confirm password
              <input
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="button" disabled={busy || !hydrated}>
            {busy ? "Please wait…" : register ? "Create account ↗" : "Log in →"}
          </button>
          <p>
            {register ? "Already have an account?" : "New to DealFlow?"}{" "}
            <Link href={register ? "/login" : "/register"}>
              {register ? "Log in" : "Create an account"}
            </Link>
          </p>
          {!register && (
            <Link href="/forgot-password">Forgot your password?</Link>
          )}
        </form>
      </section>
    </main>
  );
}
