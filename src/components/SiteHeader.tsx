import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Keine Bürokratie
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-700 dark:text-zinc-200">
          <Link className="hover:underline" href="/registration">
            Registration
          </Link>
          <Link className="hover:underline" href="/permanent-residence">
            Permanent residence
          </Link>
          <Link className="hover:underline" href="/citizenship">
            Citizenship
          </Link>
          <Link className="hover:underline" href="/einbuergerungstest">
            Test slots
          </Link>
          <Link className="hover:underline" href="/exams">
            A1 / B1
          </Link>
        </nav>
      </div>
    </header>
  );
}
