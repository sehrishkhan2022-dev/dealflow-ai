import Link from "next/link";
export default function Pricing() {
  return (
    <main className="auth-wrap">
      <Link className="brand" href="/">
        ◈ DealFlow AI
      </Link>
      <h1>Room to grow.</h1>
      <p>Proposed beta plans. Payments are not enabled.</p>
      <div className="feature-grid">
        {[
          ["Starter", "49", "250 leads · 100 AI actions"],
          ["Growth", "129", "1,000 leads · 500 AI actions"],
          ["Scale", "299", "5,000 leads · 2,000 AI actions"],
        ].map(([n, v, d]) => (
          <article className="card" key={n}>
            <h2>{n}</h2>
            <h1>
              ${v}
              <small>/month</small>
            </h1>
            <p>{d}</p>
            <Link className="button" href="/register">
              Create a workspace
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
