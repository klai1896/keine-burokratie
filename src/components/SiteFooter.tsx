import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-10 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
      <div className="mx-auto max-w-3xl space-y-4 px-4">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          This site is not an official government service. Always verify requirements, fees, and
          appointments on{" "}
          <a
            className="underline"
            href="https://www.berlin.de/"
            target="_blank"
            rel="noreferrer"
          >
            Berlin.de
          </a>
          ,{" "}
          <a
            className="underline"
            href="https://service.berlin.de/"
            target="_blank"
            rel="noreferrer"
          >
            Service Berlin
          </a>
          , and provider websites before you book or submit documents.
        </p>
        <p>
          Exam prices and dates are ingested from public pages and may be outdated. Booking links can
          include session parameters and change without notice.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link className="underline" href="/privacy">
            Privacy
          </Link>
          <Link className="underline" href="/imprint">
            Imprint / contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
