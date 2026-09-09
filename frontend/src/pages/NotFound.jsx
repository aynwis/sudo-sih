import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-basalt px-6 py-20">
      <section className="panel max-w-xl text-center">
        <p className="strata-index">404 — route not found</p>
        <h1 className="mt-3 font-display text-3xl text-bone">
          This page is outside the surveyed area.
        </h1>
        <p className="mt-3 text-sm leading-6 text-bone-dim">
          The dashboard is available at the project home page.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-ochre px-4 py-2 text-sm font-semibold text-basalt transition hover:bg-ochre-bright"
          to="/"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
