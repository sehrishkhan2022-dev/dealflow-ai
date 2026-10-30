"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="auth-wrap">
      <section className="card" role="alert">
        <h1>Something interrupted the flow.</h1>
        <p>
          Please try again. If it keeps happening, contact your workspace owner.
        </p>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
