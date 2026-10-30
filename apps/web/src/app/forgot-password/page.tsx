"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
export default function Page() {
  const [message, setMessage] = useState("");
  return (
    <main className="auth-wrap">
      <form
        className="card narrow"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = new FormData(e.currentTarget).get("email");
          try {
            await api("/auth/forgot-password", {
              method: "POST",
              body: JSON.stringify({ email }),
            });
            setMessage(
              "If an account exists, a reset link has been requested. Local development uses the API mail log.",
            );
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
      >
        <h1>Let’s get you back in.</h1>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <button className="button">Request reset link</button>
        <p role="status">{message}</p>
        <Link href="/login">Back to login</Link>
      </form>
    </main>
  );
}
