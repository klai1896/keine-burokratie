import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          English UI · non-official helper
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Move through Berlin paperwork with less guesswork
        </h1>
        <p className="max-w-2xl text-lg text-zinc-700 dark:text-zinc-300">
          Keine Bürokratie brings together three common journeys—registration, permanent residence, and
          citizenship—with checklists, official links, and narrow MVP tools for high-friction
          bookings (Einbürgerungstest slots, language exam pointers).
        </p>
      </section>

      <nav className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/registration"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
        >
          <h2 className="text-lg font-semibold">Registration (Anmeldung)</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Deadlines, typical documents, booking entry points.
          </p>
        </Link>
        <Link
          href="/permanent-residence"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
        >
          <h2 className="text-lg font-semibold">Permanent residence</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            High-level pathway notes and official services.
          </p>
        </Link>
        <Link
          href="/citizenship"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
        >
          <h2 className="text-lg font-semibold">Citizenship</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Requirements overview and application entry points.
          </p>
        </Link>
      </nav>

      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50">
        <p className="font-medium">MVP tools</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <Link className="underline" href="/einbuergerungstest">
              Einbürgerungstest booking assistant
            </Link>{" "}
            — optional email or “keep tab open” notifications when availability changes (Mon–Fri daytime
            polling · no auto-booking).
          </li>
          <li>
            <Link className="underline" href="/exams">
              A1 / B1 Berlin directory
            </Link>{" "}
            — telc / Goethe oriented rows with price & booking links (scraped on a schedule).
          </li>
        </ul>
      </section>
    </div>
  );
}
