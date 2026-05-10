"use client";

import { useEffect, useMemo, useState } from "react";

type Exam = {
  id: string;
  name: string;
  area: string;
  examSystem: string;
  levels: string[];
  priceDisplay: string;
  availableDatesDisplay: string | null;
  bookingUrl: string;
  sourcePageUrl: string;
  lastVerified: string;
};

export function ExamDirectoryClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filter, setFilter] = useState<"all" | "A1" | "B1">("all");

  useEffect(() => {
    void fetch("/api/exam-directory")
      .then((r) => r.json())
      .then((j: { exams?: Exam[] }) => setExams(j.exams ?? []));
  }, []);

  const rows = useMemo(() => {
    if (filter === "all") return exams;
    return exams.filter((e) => e.levels.includes(filter));
  }, [exams, filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 text-sm">
        <button
          type="button"
          className={`rounded px-3 py-1 ${filter === "all" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1 ${filter === "A1" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
          onClick={() => setFilter("A1")}
        >
          A1
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1 ${filter === "B1" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
          onClick={() => setFilter("B1")}
        >
          B1
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2">Venue</th>
              <th className="px-3 py-2">Area</th>
              <th className="px-3 py-2">System</th>
              <th className="px-3 py-2">Levels</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Dates / notes</th>
              <th className="px-3 py-2">Book</th>
              <th className="px-3 py-2">Verified</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-zinc-100 odd:bg-white even:bg-zinc-50 dark:border-zinc-900 odd:dark:bg-zinc-950 even:dark:bg-zinc-900/70">
                <td className="px-3 py-3 align-top font-medium">{e.name}</td>
                <td className="px-3 py-3 align-top">{e.area}</td>
                <td className="px-3 py-3 align-top">{e.examSystem}</td>
                <td className="px-3 py-3 align-top">{e.levels.join(", ")}</td>
                <td className="px-3 py-3 align-top">{e.priceDisplay}</td>
                <td className="px-3 py-3 align-top">{e.availableDatesDisplay ?? "—"}</td>
                <td className="px-3 py-3 align-top">
                  <a className="underline" href={e.bookingUrl} target="_blank" rel="noreferrer">
                    Book ({e.examSystem})
                  </a>
                </td>
                <td className="px-3 py-3 align-top text-xs">
                  {new Date(e.lastVerified).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Rows are seeded and updated by ingest jobs (`npm run ingest:exams`). Verify each offering on the
        provider site before you pay or register.
      </p>
    </div>
  );
}
