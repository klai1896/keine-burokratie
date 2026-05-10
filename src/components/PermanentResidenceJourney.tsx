"use client";

import { useState } from "react";
import Link from "next/link";
import { Checklist } from "@/components/Checklist";
import { EinbuergerungstestPanel } from "@/components/EinbuergerungstestPanel";
import { permanentResidencePathways } from "@/lib/permanent-residence-pathways";

export function PermanentResidenceJourney() {
  const [pathId, setPathId] = useState<string>("");

  const pathway = permanentResidencePathways.find((p) => p.id === pathId);

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Permanent residence in Berlin</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Start by picking the pathway that fits your history. You will see <strong>only the official links</strong>{" "}
          that match your choice (plus a checklist you can tick off locally). Citizenship preparations often run in
          parallel — Einbürgerungstest registration is included on this page too.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">1. Which pathway applies?</h2>
        <label className="block text-sm" htmlFor="pr-path">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">Your situation</span>
          <select
            id="pr-path"
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
            <h2 className="text-lg font-semibold">2. Official links for your pathway</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{pathway.summary}</p>
          </div>
          <ul className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
            {pathway.officialLinks.map((l) => (
              <li key={l.href}>
                <a className="font-medium text-emerald-800 underline dark:text-emerald-300" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <Checklist
            storageKey={`checklist-pr-${pathway.id}`}
            title="3. Preparation checklist"
            items={pathway.checklist}
          />

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Rules change — cross-check timelines, eligibility, and document PDFs linked from Service Berlin /
            Berlin.de before appointments.
          </p>
        </section>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pick a pathway to unlock tailored links and a checklist for your situation.
        </p>
      )}

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <EinbuergerungstestPanel
        compactIntro={
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Einbürgerungstest (parallel step)</h2>
            <p>
              Settlement permits typically do not require the citizenship exam, but applicants working toward{" "}
              <strong>German nationality</strong> often book early because VHS appointments are scarce. Use the picker
              and optional watcher below — same tooling as our{" "}
              <Link className="underline" href="/einbuergerungstest">
                dedicated Einbürgerungstest page
              </Link>
              .
            </p>
          </div>
        }
      />

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
