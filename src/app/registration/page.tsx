import Link from "next/link";
import { Checklist } from "@/components/Checklist";
import { getJourney } from "@/lib/journeys";

export default function RegistrationPage() {
  const j = getJourney("registration");
  if (!j) {
    throw new Error("Registration journey configuration missing");
  }

  return (
    <article className="space-y-6 text-foreground">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {j.emoji}
        </span>
        <h1 className="text-3xl font-semibold">{j.title}</h1>
      </div>
      <p className="text-lg text-primary">{j.tagline}</p>
      <p className="text-muted-foreground">{j.intro}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Typical timeline: {j.estimatedTime}</p>

      <div>
        <h2 className="text-xl font-semibold">Documents to gather (orientation)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {j.documents.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Official sources</h2>
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
        storageKey="checklist-registration"
        title="Step-by-step checklist"
        items={j.steps.map((s) => (s.detail ? `${s.title} — ${s.detail}` : s.title))}
      />

      <p className="text-sm text-muted-foreground">
        This page is summary guidance only. Requirements depend on your nationality, prior residence status, household
        composition, and municipality rules.
      </p>

      <Link className="text-sm font-medium text-primary underline decoration-primary/40" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
