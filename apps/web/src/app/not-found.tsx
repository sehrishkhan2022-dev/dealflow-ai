import Link from "next/link";
export default function NotFound() {
  return (
    <main className="auth-wrap">
      <section className="card narrow">
        <span className="eyebrow">404 / A WRONG TURN</span>
        <h1>Let’s find your way back.</h1>
        <p>This page isn’t available.</p>
        <Link className="button" href="/">
          Back to DealFlow
        </Link>
      </section>
    </main>
  );
}
