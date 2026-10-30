"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Glyph from "@/components/Glyph";
import { useRouter } from "next/navigation";
import { api, Identity, Workspace } from "@/lib/api";
const navigation = [
  ["overview", "◫", "Overview"],
  ["recovery", "↗", "Recovery Inbox"],
  ["leads", "♧", "Leads"],
  ["drafts", "▤", "Drafts & approvals"],
  ["workflows", "⌘", "Workflows"],
  ["analytics", "▥", "Analytics"],
];
const manage = [
  ["integrations", "⊞", "Integrations"],
  ["team", "♙", "Team"],
  ["billing", "▱", "Billing"],
  ["settings", "⚙", "Settings"],
];
export default function Dashboard({
  params,
}: {
  params: Promise<{ workspace: string; section: string }>;
}) {
  const { workspace, section } = use(params);
  return (
    <DashboardContent
      key={`${workspace}/${section}`}
      workspace={workspace}
      section={section}
    />
  );
}
function DashboardContent({
  workspace,
  section,
}: {
  workspace: string;
  section: string;
}) {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [current, setCurrent] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [members, setMembers] = useState<
    { id: string; name: string; email: string; role: string }[]
  >([]);
  useEffect(() => {
    let active = true;
    Promise.all([api("/me"), api(`/workspaces/${workspace}`)])
      .then(([me, ws]) => {
        if (active) {
          setIdentity(me);
          setCurrent(ws);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    if (section === "team")
      api(`/workspaces/${workspace}/members`)
        .then((data) => {
          if (active) setMembers(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, [workspace, section]);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  const title =
    [...navigation, ...manage].find((n) => n[0] === section)?.[2] ||
    "Page unavailable";
  return (
    <div className="app-shell">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <aside
        className={`sidebar ${menu ? "open" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setMenu(false);
            document
              .querySelector<HTMLButtonElement>(".mobile-toggle")
              ?.focus();
          }
        }}
      >
        <button
          className="sidebar-close"
          aria-label="Close navigation"
          onClick={() => {
            setMenu(false);
            document
              .querySelector<HTMLButtonElement>(".mobile-toggle")
              ?.focus();
          }}
        >
          ×
        </button>
        <Link className="brand" href="/">
          ◈{" "}
          <span>
            DealFlow<span className="brand-ai"> AI</span>
          </span>
        </Link>
        <div className="workspace-selector">
          <div className="workspace-avatar">
            {current?.name.charAt(0) || "D"}
          </div>
          <label className="sr-only" htmlFor="workspace">
            Switch workspace
          </label>
          <select
            id="workspace"
            value={workspace}
            onChange={(e) => router.push(`/app/${e.target.value}/overview`)}
          >
            {!identity && <option value={workspace}>Loading workspace…</option>}
            {identity?.workspaces.map((w) => (
              <option value={w.id} key={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Workspace">
          {navigation.map(([s, i, n]) => (
            <Link
              onClick={() => setMenu(false)}
              aria-current={section === s ? "page" : undefined}
              className={section === s ? "active" : ""}
              href={`/app/${workspace}/${s}`}
              key={s}
            >
              <span aria-hidden="true">
                <Glyph name={i} />
              </span>
              {n}
              {s === "recovery" && <b className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <span className="nav-label">MANAGE</span>
        <nav aria-label="Manage">
          {manage.map(([s, i, n]) => (
            <Link
              onClick={() => setMenu(false)}
              aria-current={section === s ? "page" : undefined}
              className={section === s ? "active" : ""}
              href={`/app/${workspace}/${s}`}
              key={s}
            >
              <span aria-hidden="true">
                <Glyph name={i} />
              </span>
              {n}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="foundation">
            <span>✧ BUILT WITH INTENTION</span>
            <p>
              A strong foundation.
              <br />A thoughtful next step.
            </p>
            <small>Phase 0 · Private development</small>
          </div>
          <button className="profile" onClick={logout}>
            <span className="avatar">
              {identity?.user.name.charAt(0) || "·"}
            </span>
            <span>
              {identity?.user.name || "Your account"}
              <small>Log out ↗</small>
            </span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div>
            <button
              aria-expanded={menu}
              aria-label="Toggle navigation"
              className="mobile-toggle"
              onClick={() => {
                setMenu(!menu);
                if (!menu)
                  requestAnimationFrame(() =>
                    document
                      .querySelector<HTMLAnchorElement>(
                        '[aria-label="Workspace"] a',
                      )
                      ?.focus(),
                  );
              }}
            >
              ☰
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>{title}</strong>
            </span>
          </div>
          <div className="header-right">
            <span className="phase-pill">
              <i /> Foundation release
            </span>
            <span className="avatar pale">
              {identity?.user.name.charAt(0) || "·"}
            </span>
          </div>
        </header>
        <main id="content" className="dashboard">
          {error ? (
            <section className="card" role="alert">
              <h1>We couldn’t open this workspace.</h1>
              <p>{error}</p>
              <Link className="button" href="/login">
                Go to login
              </Link>
            </section>
          ) : !current ? (
            <div className="card skeleton" role="status">
              Loading your workspace…
            </div>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">YOUR WORKSPACE, AT A GLANCE</span>
                  <h1>
                    {section === "overview"
                      ? `A little clarity. A lot of possibility.`
                      : title}
                  </h1>
                  <p>
                    {section === "overview"
                      ? `Welcome back, ${identity?.user.name.split(" ")[0] || "there"}. Let’s keep good things moving.`
                      : "Your team’s home for thoughtful follow-through."}
                  </p>
                </div>
                <span className="date-chip">◷ {current.timezone}</span>
              </div>
              {current.is_demo && (
                <div className="demo-banner">
                  <span className="demo-tag">DEMO WORKSPACE</span>
                  <span>
                    You’re exploring a seeded demonstration workspace. No live
                    customer data or connected providers.
                  </span>
                </div>
              )}
              {identity && !identity.user.email_verified_at && (
                <div className="notice">
                  Verify your email before creating a workspace.{" "}
                  <button
                    onClick={async () => {
                      try {
                        await api("/auth/verification-notification", {
                          method: "POST",
                        });
                        setNotice(
                          "Verification requested. In local development, check the API mail log.",
                        );
                      } catch (e) {
                        setNotice((e as Error).message);
                      }
                    }}
                  >
                    Request verification link
                  </button>
                </div>
              )}
              {notice && (
                <p role="status" className="notice">
                  {notice}
                </p>
              )}
              {section === "overview" ? (
                <>
                  <div className="metric-grid">
                    {[
                      [
                        "◎",
                        "Open opportunities",
                        "0",
                        "Ready when your pipeline is.",
                        "purple",
                      ],
                      [
                        "↗",
                        "Needs follow-up",
                        "0",
                        "Nothing waiting on you.",
                        "amber",
                      ],
                      [
                        "▥",
                        "Pipeline at risk",
                        "$0",
                        "Opportunity value, not revenue.",
                        "blue",
                      ],
                      [
                        "✓",
                        "Confirmed recovered",
                        "$0",
                        "Only verified closed-won outcomes.",
                        "green",
                      ],
                    ].map(([i, n, v, d, c]) => (
                      <article className="metric card" key={n}>
                        <div>
                          <span className={`metric-icon ${c}`}>
                            <Glyph name={i} />
                          </span>
                          <span className="metric-label">{n}</span>
                        </div>
                        <strong>{v}</strong>
                        <small>{d}</small>
                      </article>
                    ))}
                  </div>
                  <div className="dashboard-grid">
                    <section className="card journey">
                      <div className="section-heading">
                        <div>
                          <span className="eyebrow">A GOOD PLACE TO START</span>
                          <h2>Set your team up for what’s next.</h2>
                        </div>
                        <span className="step-count">1 of 3</span>
                      </div>
                      <p>
                        Your workspace is ready. Here’s the path from a fresh
                        start to a stronger follow-up habit.
                      </p>
                      <div className="progress-track">
                        <i />
                      </div>
                      <div className="setup-step">
                        <span className="step-icon done">✓</span>
                        <div>
                          <h3>Create your workspace</h3>
                          <p>
                            A dedicated home for your team and its
                            opportunities.
                          </p>
                        </div>
                        <span className="badge green">Complete</span>
                      </div>
                      <div className="setup-step">
                        <span className="step-icon">2</span>
                        <div>
                          <h3>Bring your leads together</h3>
                          <p>
                            Lead management and CSV import arrive in Phase 1.
                          </p>
                        </div>
                        <span className="badge neutral">Coming next</span>
                      </div>
                      <div className="setup-step">
                        <span className="step-icon">3</span>
                        <div>
                          <h3>Connect the conversation</h3>
                          <p>Authorized inbox connections arrive in Phase 2.</p>
                        </div>
                        <span className="badge neutral">Planned</span>
                      </div>
                    </section>
                    <section className="card principle">
                      <div className="orb">✧</div>
                      <span className="eyebrow">THOUGHTFUL BY DESIGN</span>
                      <h2>
                        Your relationships.
                        <br />
                        Your decisions.
                      </h2>
                      <p>
                        Every future recommendation starts with evidence. Every
                        outbound message needs a human’s approval.
                      </p>
                      <div>
                        <span>◉</span> Providers are safely disconnected
                      </div>
                      <div>
                        <span>◇</span> No external messages can be sent
                      </div>
                    </section>
                    <section className="card opportunities">
                      <div className="section-heading">
                        <h2>Priority opportunities</h2>
                        <Link href={`/app/${workspace}/recovery`}>
                          View inbox ↗
                        </Link>
                      </div>
                      <div className="empty">
                        <span className="empty-icon">
                          <Glyph name="↗" />
                        </span>
                        <h3>A clean slate.</h3>
                        <p>
                          When lead recovery is enabled, opportunities needing
                          <br />
                          attention will find their home here.
                        </p>
                        <span className="badge neutral">
                          Recovery engine · Phase 1
                        </span>
                      </div>
                    </section>
                    <section className="card activity">
                      <div className="section-heading">
                        <h2>Workspace details</h2>
                        <span>◌</span>
                      </div>
                      <dl>
                        <div>
                          <dt>Workspace</dt>
                          <dd>{current.name}</dd>
                        </div>
                        <div>
                          <dt>Your role</dt>
                          <dd>
                            {current.pivot?.role?.replaceAll("_", " ") ||
                              "Member"}
                          </dd>
                        </div>
                        <div>
                          <dt>Region</dt>
                          <dd>{current.region}</dd>
                        </div>
                        <div>
                          <dt>Data mode</dt>
                          <dd>
                            {current.is_demo ? "Demonstration" : "Live · empty"}
                          </dd>
                        </div>
                      </dl>
                      <div className="activity-note">
                        <i /> A solid start. Your workspace is isolated and
                        access-controlled.
                      </div>
                    </section>
                  </div>
                  <div className="data-note">
                    ⓘ Foundation release · Business metrics are zero until Phase
                    1 records exist. Timezone: {current.timezone}.
                  </div>
                </>
              ) : section === "team" ? (
                <section className="card">
                  <h2>The people behind the progress.</h2>
                  <p>Workspace members and their access roles.</p>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((m) => (
                          <tr key={m.id}>
                            <td>{m.name}</td>
                            <td>{m.email}</td>
                            <td>
                              <span className="badge purple">
                                {m.role.replaceAll("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="muted">
                    Invitations and member management are planned for Phase 3.
                  </p>
                </section>
              ) : section === "settings" ? (
                <section className="card narrow">
                  <h2>Workspace settings</h2>
                  <dl>
                    <div>
                      <dt>Name</dt>
                      <dd>{current.name}</dd>
                    </div>
                    <div>
                      <dt>Timezone</dt>
                      <dd>{current.timezone}</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd>{current.region}</dd>
                    </div>
                  </dl>
                  <Link className="button secondary" href="/onboarding">
                    Create another workspace
                  </Link>
                  <p className="muted">
                    Settings editing, exports and deletion workflows arrive in
                    Phase 3.
                  </p>
                </section>
              ) : section === "integrations" ? (
                <section className="card">
                  <h2>A connection, when you’re ready.</h2>
                  <p>
                    Providers are disconnected. Live connections are outside
                    this foundation release.
                  </p>
                  <div className="feature-grid">
                    {["Gmail", "AI assistant", "Billing"].map((n) => (
                      <article className="integration" key={n}>
                        <span className="empty-icon">
                          <Glyph name="⊞" />
                        </span>
                        <h3>{n}</h3>
                        <span className="badge neutral">Disconnected</span>
                        <p>Mock boundary only. No external requests.</p>
                        <button className="button secondary" disabled>
                          Available in a later phase
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="card empty">
                  <span className="empty-icon">
                    {navigation.find((n) => n[0] === section)?.[1] || "◇"}
                  </span>
                  <span className="eyebrow">ROOM FOR WHAT’S NEXT</span>
                  <h2>{title}</h2>
                  <p>
                    {section === "billing"
                      ? "Payments are not enabled. Pricing and subscriptions require a separate review."
                      : "This space is ready for the next milestone. No records or activity have been created."}
                  </p>
                  <span className="badge neutral">
                    {["billing"].includes(section)
                      ? "Planned for Phase 3"
                      : "Planned for Phase 1"}
                  </span>
                  <Link href={`/app/${workspace}/overview`}>
                    ← Back to overview
                  </Link>
                </section>
              )}
            </>
          )}
          <footer className="dashboard-footer">
            <span>
              DealFlow AI <span className="muted">/ A better next step.</span>
            </span>
            <span>Built for people, powered by clarity.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
