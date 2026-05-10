import Link from "next/link";
import { ExamDirectoryClient } from "@/components/ExamDirectoryClient";

export default function ExamsPage() {
  return (
    <article className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">A1 / B1 exams in Berlin (telc · Goethe)</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Filter GoetheInstitut Berlin pages and verified telc partners that publish exam dates and
          booking entry points. Prices and sessions change — every row includes a{" "}
          <strong>last verified</strong> timestamp from our ingest job.
        </p>
      </div>

      <ExamDirectoryClient />

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
