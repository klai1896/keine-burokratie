import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background/80 py-10 text-sm text-muted-foreground backdrop-blur-sm">
      <div className="mx-auto max-w-3xl space-y-4 px-4 md:px-6">
        <p className="font-medium text-foreground">
          This site is not an official government service. Always verify requirements, fees, and appointments on{" "}
          <a className="underline decoration-primary/50" href="https://www.berlin.de/" target="_blank" rel="noreferrer">
            Berlin.de
          </a>
          ,{" "}
          <a
            className="underline decoration-primary/50"
            href="https://service.berlin.de/"
            target="_blank"
            rel="noreferrer"
          >
            Service Berlin
          </a>
          , and provider websites before you book or submit documents.
        </p>
        <p>
          Exam prices and dates are ingested from public pages and may be outdated. Booking links can include session
          parameters and change without notice.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link className="underline decoration-primary/40" href="/privacy">
            Privacy
          </Link>
          <Link className="underline decoration-primary/40" href="/imprint">
            Imprint / contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
