"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Identity } from "@/lib/api";
export default function Onboarding() {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("/me")
      .then((data) => {
        if (active) setIdentity(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const workspace = await api("/workspaces", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      router.push(`/app/${workspace.id}/overview`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-wrap">
      <form method="post" className="card narrow" onSubmit={submit}>
        <span className="eyebrow">01 / YOUR TEAM’S HOME</span>
        <h1>A fresh start.</h1>
        <p>Create a workspace. You can connect your tools in a later phase.</p>
        {identity && !identity.user.email_verified_at && (
          <div className="notice">
            <strong>First, verify your email.</strong>
            <p>
              Open the verification link requested at signup. Local development
              delivers it to the API mail log.
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await api("/auth/verification-notification", {
                    method: "POST",
                  });
                  setNotice(
                    "Verification requested. Check the local API mail log.",
                  );
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Request another link
            </button>
          </div>
        )}
        {notice && <p role="status">{notice}</p>}
        <label>
          Workspace name
          <input name="name" required maxLength={100} />
        </label>
        <label>
          Region
          <select name="region">
            <option>US</option>
            <option>UK</option>
            <option>CA</option>
            <option>AU</option>
            <option>PK</option>
          </select>
        </label>
        <label>
          Timezone
          <input
            name="timezone"
            defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
            required
          />
        </label>
        <label className="checkbox">
          <input type="checkbox" name="terms_accepted" value="1" required />I
          accept the beta data-processing notice: use demonstration data only;
          do not upload customer data in this foundation release.
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button
          className="button"
          disabled={busy || !identity?.user.email_verified_at}
        >
          {busy ? "Creating…" : "Create workspace →"}
        </button>
      </form>
    </main>
  );
}
