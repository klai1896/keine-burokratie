"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamDirectoryClient } from "@/components/ExamDirectoryClient";
import { EinbuergerungstestPanel } from "@/components/EinbuergerungstestPanel";
import { PrTrackableChecklist } from "@/components/PrTrackableChecklist";
import { getJourney } from "@/lib/journeys";
import { permanentResidencePathways } from "@/lib/permanent-residence-pathways";

export function PermanentResidenceJourney() {
  const [pathId, setPathId] = useState<string>("");
  const residenceIntro = getJourney("residence")?.intro;

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const qs = new URLSearchParams(window.location.search).get("pathway")?.trim();
        if (qs && permanentResidencePathways.some((p) => p.id === qs)) {
          setPathId(qs);
        }
      } catch {
        /* ignore */
      }
    });
  }, []);

  const pathway = permanentResidencePathways.find((p) => p.id === pathId);

  return (
    <article className="space-y-8 text-foreground">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">{getJourney("residence")?.title ?? "Permanent residence"}</h1>
        <p className="text-muted-foreground">
          {residenceIntro}{" "}
          Start by picking the pathway that fits your history to see tailored official links and a granular checklist.
          Book language exams (A1/B1), the Einbürgerungstest, and walk your checklist without hopping between hubs.
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Typical horizon: {getJourney("residence")?.estimatedTime}
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-border bg-card/80 p-4 text-card-foreground shadow-soft backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-foreground">1. Which pathway applies?</h2>
        <label className="block text-sm" htmlFor="pr-path">
          <span className="font-medium text-foreground">Your situation</span>
          <select
            id="pr-path"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            value={pathId}
            onChange={(e) => setPathId(e.target.value)}
          >
            <option value="">Select one…</option>
            {permanentResidencePathways.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      {pathway ? (
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Official links for your pathway</h2>
            <p className="text-sm text-muted-foreground">{pathway.summary}</p>
          </div>
          <ul className="space-y-2 rounded-xl border border-border bg-gradient-card p-4 text-sm shadow-soft">
            {pathway.officialLinks.map((l) => (
              <li key={l.href}>
                <a className="font-medium text-primary underline decoration-primary/40" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <PrTrackableChecklist
            key={pathway.id}
            pathwayId={pathway.id}
            title="3. Document & evidence checklist (granular)"
            items={pathway.checklist}
          />

          <p className="text-xs text-muted-foreground">
            Rules change — cross-check timelines, eligibility, and document PDFs linked from Service Berlin / Berlin.de
            before appointments.
          </p>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pick a pathway to unlock tailored links, a granular checklist, and optional email backups.
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Language exams in Berlin (A1 · B1)</h2>
        <ExamDirectoryClient variant="embedded" restrictLevels={["A1", "B1"]} />
      </section>

      <hr className="border-border" />

      <EinbuergerungstestPanel
        compactIntro={
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Einbürgerungstest (parallel step)</h2>
            <p>
              Settlement permits typically do not require the citizenship exam, but applicants working toward{" "}
              <strong>German nationality</strong> often book early because VHS appointments are scarce. Use the picker
              and optional watcher below — same tooling as our{" "}
              <Link className="font-medium text-primary underline decoration-primary/40" href="/einbuergerungstest">
                dedicated Einbürgerungstest page
              </Link>
              .
            </p>
          </div>
        }
      />

      <Link className="text-sm font-medium text-primary underline decoration-primary/40" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
