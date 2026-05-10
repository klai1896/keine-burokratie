import Link from "next/link";
import { ExamDirectoryClient } from "@/components/ExamDirectoryClient";

export default function ExamsPage() {
  return (
    <article className="space-y-6 text-foreground">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">A1 / B1 exams in Berlin (telc · Goethe)</h1>
        <p className="text-muted-foreground">
          Goethe listings show the <strong className="text-foreground">soonest exam date where booking is still open</strong>{" "}
          (sold-out dates are skipped). Telc centres point at the official finder — confirm locally. Listing check time
          is shown per row after each ingest run.
        </p>
      </div>

      <ExamDirectoryClient />

      <Link className="text-sm font-medium text-primary underline decoration-primary/40" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
