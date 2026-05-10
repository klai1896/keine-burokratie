import Link from "next/link";
import { Checklist } from "@/components/Checklist";
import { ExamDirectoryClient } from "@/components/ExamDirectoryClient";
import { EinbuergerungstestPanel } from "@/components/EinbuergerungstestPanel";
import { getJourney } from "@/lib/journeys";

export default function CitizenshipPage() {
  const j = getJourney("citizenship");
  if (!j) {
    throw new Error("Citizenship journey configuration missing");
  }

  return (
    <article className="space-y-8 text-foreground">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {j.emoji}
        </span>
        <h1 className="text-3xl font-semibold">{j.title}</h1>
      </div>
      <p className="text-lg text-primary">{j.tagline}</p>
      <p className="text-muted-foreground">{j.intro}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Typical timeline: {j.estimatedTime}
      </p>

      <div>
        <h2 className="text-xl font-semibold">Documents to orient around</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {j.documents.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Official anchors</h2>
        <ul className="mt-3 space-y-2 rounded-xl border border-border bg-gradient-card p-4 text-sm shadow-soft">
          {j.officialLinks.map((l) => (
            <li key={l.href}>
              <a className="font-medium text-primary underline decoration-primary/40" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Checklist
        storageKey="checklist-citizenship"
        title="Citizenship journey checklist"
        items={j.steps.map((s) => (s.detail ? `${s.title} — ${s.detail}` : s.title))}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Language exams in Berlin (A1 · B1)</h2>
        <ExamDirectoryClient variant="embedded" restrictLevels={["A1", "B1"]} />
      </section>

      <EinbuergerungstestPanel
        compactIntro={
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Citizenship test appointments</h2>
            <p className="text-muted-foreground">
              Booking the Einbürgerungstest happens through Berlin VHS sub-locations below. Availability changes quickly —
              pick a campus, open the campus deep link we store for that site, then optionally activate notifications on
              the same page.
            </p>
          </div>
        }
      />

      <p className="text-sm text-muted-foreground">
        This site does not provide legal advice. When in doubt, consult a qualified adviser.
      </p>

      <Link className="text-sm font-medium text-primary underline decoration-primary/40" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
