"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
export default function Page() {
  const [message, setMessage] = useState("");
  return (
    <main className="auth-wrap">
      <form
        className="card narrow"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const data = Object.fromEntries(new FormData(e.currentTarget));
            data.token =
              new URLSearchParams(window.location.search).get("token") || "";
            await api("/auth/reset-password", {
              method: "POST",
              body: JSON.stringify(data),
            });
            setMessage("Password reset. You can now log in.");
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
      >
        <h1>A new password.</h1>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" minLength={12} required />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            name="password_confirmation"
            minLength={12}
            required
          />
        </label>
        <button className="button">Reset password</button>
        <p role="status">{message}</p>
        <Link href="/login">Log in</Link>
      </form>
    </main>
  );
}
