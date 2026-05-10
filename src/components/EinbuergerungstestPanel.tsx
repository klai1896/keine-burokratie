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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
        setSelectedIds((prev) => {
          const keep = prev.filter((id) => list.some((t) => t.id === id));
          if (keep.length > 0) return keep;
          return list[0]?.id ? [list[0].id] : [];
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(
          "Could not load VHS locations. Start Postgres, run `npm run db:push` and `npm run db:seed`, then refresh.",
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

  function toggleLocation(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next.length > 0 ? next : prev;
      }
      return [...prev, id];
    });
  }

  const mainServiceUrl = "https://service.berlin.de/dienstleistung/351180/";

  return (
    <div className="space-y-8">
      {intro ? <div className="space-y-3 text-muted-foreground">{intro}</div> : null}

      {compactIntro ? <div className="text-sm text-muted-foreground">{compactIntro}</div> : null}

      <section className="space-y-3 rounded-xl border border-border bg-card/70 p-4 text-card-foreground shadow-soft backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-foreground">Choose Berlin VHS test locations</h2>
        <p className="text-sm text-muted-foreground">
          Select <strong className="text-foreground">every campus</strong> where you might book. Links open{" "}
          <a className="font-medium text-primary underline decoration-primary/40" href={mainServiceUrl}>
            Service Berlin’s Einbürgerungstest flow
          </a>{" "}
          filtered to each sub-location — you complete payment yourself on the official site.
        </p>

        {loadError ? <p className="text-sm text-destructive">{loadError}</p> : null}
        {!loadError && loading ? <p className="text-sm text-muted-foreground">Loading campus list…</p> : null}
        {!loadError && !loading && targets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No campuses found. Confirm the seed script created `service_target` rows for Einbürgerungstest.
          </p>
        ) : null}

        {!loadError && !loading && targets.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {targets.map((t) => {
              const active = selectedIds.includes(t.id);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => toggleLocation(t.id)}
                    aria-pressed={active}
                    className={`h-full w-full rounded-xl border p-4 text-left text-sm shadow-soft transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary ring-2 ring-primary/35" : "border-border bg-card/90 hover:border-primary/35"}`}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                        aria-hidden
                      >
                        {active ? "✓" : ""}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">{t.labelEn}</span>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          Toggle multiple campuses; selections feed the watcher below.
                        </span>
                        <a
                          className="mt-3 inline-block text-xs font-medium text-primary underline decoration-primary/45"
                          href={t.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open booking on Service Berlin →
                        </a>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Optional slot watch (MVP)</h2>
        <p className="text-sm text-muted-foreground">
          We poll <strong className="text-foreground">only</strong> on Berlin weekdays (Mon–Fri) from{" "}
          <strong className="text-foreground">07:00 Europe/Berlin</strong>. You receive email and/or desktop
          notifications — you still confirm the appointment yourself on Service Berlin (any campus you opted into may
          match).
        </p>
        {!loadError ? (
          <WatchWizard targets={targets} selectedTargetIds={selectedIds} onSelectedTargetIdsChange={setSelectedIds} />
        ) : null}
      </section>
    </div>
  );
}
