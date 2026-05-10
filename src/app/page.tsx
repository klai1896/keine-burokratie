import Link from "next/link";
import type { Journey } from "@/lib/journeys";
import { journeys, journeyPath } from "@/lib/journeys";

function journeyCardAccentClasses(accent: Journey["accent"]) {
  switch (accent) {
    case "coral":
      return "border-primary/40 hover:border-primary/90 hover:shadow-pop";
    case "mint":
      return "border-sky-400/55 hover:border-sky-500/85 hover:shadow-soft dark:border-sky-400/40 dark:hover:border-sky-300/75";
    case "lavender":
      return "border-indigo-300/65 hover:border-indigo-400/90 hover:shadow-soft dark:border-indigo-400/35 dark:hover:border-indigo-300/65";
    default:
      return "border-border hover:shadow-soft";
  }
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">English UI · non-official helper</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Move through Berlin paperwork with less guesswork</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Keine Bürokratie brings together three common journeys—registration, permanent residence, and citizenship—with
          checklists, official links, and narrow MVP tools for high-friction bookings (Einbürgerungstest slots, language
          exam pointers).
        </p>
      </section>

      <nav className="grid gap-4 sm:grid-cols-3">
        {journeys.map((j) => (
          <Link
            key={j.slug}
            href={journeyPath[j.slug]}
            className={`rounded-xl border bg-gradient-card p-5 shadow-soft transition ${journeyCardAccentClasses(j.accent)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl leading-none" aria-hidden>
                {j.emoji}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">{j.title}</h2>
                <p className="mt-1 text-sm text-primary">{j.tagline}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{j.intro}</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">Typical timeline: {j.estimatedTime}</p>
          </Link>
        ))}
      </nav>

      <section className="rounded-xl border border-primary/25 bg-gradient-card p-5 shadow-soft">
        <p className="font-display text-base font-semibold text-foreground">MVP tools</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            <Link className="font-medium text-primary underline decoration-primary/40" href="/einbuergerungstest">
              Einbürgerungstest booking assistant
            </Link>{" "}
            — optional email or “keep tab open” notifications when availability changes (Mon–Fri daytime polling · no
            auto-booking).
          </li>
          <li>
            <Link className="font-medium text-primary underline decoration-primary/40" href="/exams">
              A1 / B1 Berlin directory
            </Link>{" "}
            — telc / Goethe oriented rows with price and booking links (scraped on a schedule).
          </li>
        </ul>
      </section>
    </div>
  );
}
