"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WatchWizard, type ServiceTargetRow } from "@/components/WatchWizard";

type Props = {
  /** Extra context shown above campus cards (Markdown-free HTML from parent ok). */
  intro?: ReactNode;
  compactIntro?: ReactNode;
};

export function EinbuergerungstestPanel({ intro, compactIntro }: Props) {
  const [targets, setTargets] = useState<ServiceTargetRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/service-targets")
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<{ targets?: ServiceTargetRow[] }>;
      })
      .then((j) => {
        if (cancelled) return;
        const list = j.targets ?? [];
        setTargets(list);
        setLoadError(null);
        setSelectedId((prev) => (prev ? prev : list[0]?.id ?? ""));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(
          "Could not load VHS locations. Start Postgres (`docker compose up -d`), run `DATABASE_URL=… npm run db:push` and `npm run db:seed`, then refresh.",
        );
        setTargets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mainServiceUrl = "https://service.berlin.de/dienstleistung/351180/";

  return (
    <div className="space-y-8">
      {intro ? <div className="space-y-3 text-zinc-700 dark:text-zinc-300">{intro}</div> : null}

      {compactIntro ? <div className="text-sm text-zinc-700 dark:text-zinc-300">{compactIntro}</div> : null}

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <h2 className="text-lg font-semibold">Choose a Berlin VHS test location</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Pick where you plan to register. Links open{" "}
          <a className="underline" href={mainServiceUrl}>
            Service Berlin’s Einbürgerungstest flow
          </a>{" "}
          filtered to each sub-location — you complete payment and booking yourself on the official site.
        </p>

        {loadError ? <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p> : null}
        {!loadError && loading ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading campus list…</p>
        ) : null}
        {!loadError && !loading && targets.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No campuses found. Confirm the seed script created `service_target` rows for Einbürgerungstest.
          </p>
        ) : null}

        {!loadError && !loading && targets.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {targets.map((t) => {
              const active = selectedId === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`h-full w-full rounded-lg border p-4 text-left text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 ${active ? "border-zinc-900 ring-2 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-200" : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"}`}
                  >
                    <span className="block font-medium text-zinc-900 dark:text-zinc-50">{t.labelEn}</span>
                    <span className="mt-2 block text-xs text-zinc-600 dark:text-zinc-400">
                      Selected here also updates the watcher below so notifications match this campus.
                    </span>
                    <a
                      className="mt-3 inline-block text-xs font-medium text-emerald-800 underline decoration-emerald-800/70 dark:text-emerald-300 dark:decoration-emerald-300/70"
                      href={t.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open booking on Service Berlin →
                    </a>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Optional slot watch (MVP)</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          We poll <strong>only</strong> on Berlin weekdays (Mon–Fri) from{" "}
          <strong>07:00 Europe/Berlin</strong>. You receive email and/or desktop notifications — you still confirm
          the appointment yourself on Service Berlin.
        </p>
        {!loadError ? (
          <WatchWizard targets={targets} selectedTargetId={selectedId} onSelectedTargetIdChange={setSelectedId} />
        ) : null}
      </section>
    </div>
  );
}
