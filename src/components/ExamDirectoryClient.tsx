"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Exam = {
  id: string;
  name: string;
  area: string;
  examSystem: string;
  levels: string[];
  priceDisplay: string;
  availableDatesDisplay: string | null;
  soonestBookableAt?: string | null;
  bookingUrl: string;
  sourcePageUrl: string;
  lastVerified: string;
};

export type ExamDirectoryClientProps = {
  /** When set, only rows that include at least one of these levels (e.g. journey pages). */
  restrictLevels?: ("A1" | "B1")[];
  /** `embedded` tightens copy for use inside journey pages. */
  variant?: "full" | "embedded";
};

export function ExamDirectoryClient({ restrictLevels, variant = "full" }: ExamDirectoryClientProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "A1" | "B1">("all");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/exam-directory")
      .then(async (r) => {
        const raw = await r.text();
        if (!raw.trim()) {
          return { ok: r.ok, exams: [] as Exam[], err: r.ok ? null : `Empty response (${r.status})` };
        }
        try {
          const j = JSON.parse(raw) as { exams?: Exam[]; error?: string };
          return {
            ok: r.ok,
            exams: j.exams ?? [],
            err: r.ok ? null : (j.error ?? `Request failed (${r.status})`),
          };
        } catch {
          return { ok: false, exams: [] as Exam[], err: "Invalid JSON from exam directory API" };
        }
      })
      .then(({ exams: list, err }) => {
        if (cancelled) return;
        setExams(list);
        setLoadError(err);
      })
      .catch(() => {
        if (!cancelled) {
          setExams([]);
          setLoadError("Could not load exam directory.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    let list = exams;
    if (restrictLevels?.length) {
      list = list.filter((e) => e.levels.some((lv) => restrictLevels.includes(lv as "A1" | "B1")));
    }
    if (restrictLevels?.length) {
      return list;
    }
    if (filter === "all") return list;
    return list.filter((e) => e.levels.includes(filter));
  }, [exams, filter, restrictLevels]);

  function chip(active: boolean) {
    return [
      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
      active
        ? "bg-primary text-primary-foreground shadow-soft"
        : "border border-border bg-card/70 text-muted-foreground hover:border-primary/30 hover:text-foreground",
    ].join(" ");
  }

  function formatSoonest(e: Exam): string {
    if (e.soonestBookableAt) {
      return new Date(e.soonestBookableAt).toLocaleDateString(undefined, { dateStyle: "medium" });
    }
    return e.availableDatesDisplay?.trim() || "—";
  }

  return (
    <div className="space-y-4">
      {variant === "embedded" ? (
        <p className="text-sm text-muted-foreground">
          Goethe Berlin pages are scraped for the <strong className="text-foreground">earliest exam date that still has an
          open booking button</strong> (sold-out rows are skipped). Telc rows link to the official centre finder —
          dates are confirmed with each school.
          {restrictLevels?.length ? (
            <>
              {" "}
              Showing <strong className="text-foreground">{restrictLevels.join(" & ")}</strong> only.{" "}
              <Link className="font-medium text-primary underline decoration-primary/40" href="/exams">
                Full exam directory →
              </Link>
            </>
          ) : null}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 text-sm">
            <button type="button" className={chip(filter === "all")} onClick={() => setFilter("all")}>
              All
            </button>
            <button type="button" className={chip(filter === "A1")} onClick={() => setFilter("A1")}>
              A1
            </button>
            <button type="button" className={chip(filter === "B1")} onClick={() => setFilter("B1")}>
              B1
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Goethe ingest uses the institute&apos;s JSON API where reachable; rows show the soonest slot with a live
            &quot;Buchen&quot; action, not the first calendar line that may already be full.
          </p>
        </>
      )}

      {loadError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <p className="font-medium">Could not load exam listings.</p>
          <p className="mt-1 text-xs opacity-90">{loadError}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Often this means Postgres is stopped, or the DB is missing newer columns (
            <code className="text-foreground">soonest_bookable_at</code>, etc.). Run{" "}
            <code className="text-foreground">npm run db:push</code> from the project root, then reload.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card/60 shadow-soft backdrop-blur-sm">
        <table className="min-w-full text-left text-sm text-card-foreground">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Venue</th>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">System</th>
              <th className="px-3 py-2">Levels</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Book</th>
              <th className="px-3 py-2">Soonest bookable</th>
              <th className="px-3 py-2">Listing checked</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr
                key={e.id}
                className="border-b border-border/80 odd:bg-card/85 even:bg-muted/35"
              >
                <td className="px-3 py-3 align-top font-medium">{e.name}</td>
                <td className="px-3 py-3 align-top text-muted-foreground">{e.area}</td>
                <td className="px-3 py-3 align-top text-muted-foreground">{e.examSystem}</td>
                <td className="px-3 py-3 align-top text-muted-foreground">{e.levels.join(", ")}</td>
                <td className="px-3 py-3 align-top">{e.priceDisplay}</td>
                <td className="px-3 py-3 align-top text-xs text-muted-foreground">{e.availableDatesDisplay ?? "—"}</td>
                <td className="px-3 py-3 align-top">
                  <a
                    className="font-medium text-primary underline decoration-primary/40"
                    href={e.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Book ({e.examSystem})
                  </a>
                </td>
                <td className="px-3 py-3 align-top text-sm font-medium text-foreground">{formatSoonest(e)}</td>
                <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                  {new Date(e.lastVerified).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Always confirm price and seat on the provider before paying. Run <code className="text-foreground">npm run ingest:exams</code>{" "}
        to refresh Goethe dates.
      </p>
    </div>
  );
}
