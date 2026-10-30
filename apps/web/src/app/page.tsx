import Link from "next/link";
export default function Home() {
  return (
    <main className="marketing">
      <nav>
        <Link className="brand" href="/">
          ◈{" "}
          <span>
            DealFlow<span className="brand-ai"> AI</span>
          </span>
        </Link>
        <div>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Log in</Link>
          <Link className="button" href="/register">
            Get started ↗
          </Link>
        </div>
      </nav>
      <section className="hero">
        <span className="eyebrow">EVERY OPPORTUNITY DESERVES A NEXT STEP</span>
        <h1>
          Good conversations.
          <br />
          Better <em>follow-through.</em>
        </h1>
        <p>
          Your next opportunity might already be in your inbox. Give your team a
          calmer way to spot missed follow-ups and keep relationships moving.
        </p>
        <div className="actions">
          <Link className="button" href="/register">
            Build your workspace ↗
          </Link>
          <Link className="button secondary" href="/login">
            Explore your workspace
          </Link>
        </div>
        <small>Human decisions. Clear evidence. No autonomous sending.</small>
      </section>
      <section className="feature-grid">
        {[
          [
            "01",
            "See what needs you",
            "An organized home for the conversations that deserve attention.",
          ],
          [
            "02",
            "Keep people in control",
            "Review the context before choosing your next step.",
          ],
          [
            "03",
            "Measure what happened",
            "A clear distinction between opportunity and confirmed revenue.",
          ],
        ].map(([n, t, d]) => (
          <article className="card" key={n}>
            <span className="eyebrow">{n} / THE DEALFLOW WAY</span>
            <h2>{t}</h2>
            <p>{d}</p>
          </article>
        ))}
      </section>
      <footer>
        ◈ DealFlow AI{" "}
        <span>Thoughtful follow-ups. Stronger relationships.</span>
      </footer>
    </main>
  );
}
