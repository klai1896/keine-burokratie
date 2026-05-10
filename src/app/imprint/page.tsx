import Link from "next/link";

export default function ImprintPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      <h1 className="text-2xl font-semibold">Imprint & contact</h1>
      <p>
        <strong>Project:</strong> Keine Bürokratie (internal codename for the Berlin relocation &
        immigration companion MVP).
      </p>
      <p>
        <strong>Contact:</strong> add a monitored inbox / legal entity details here before public
        launch.
      </p>
      <p>
        <strong>Responsible content notice:</strong> All statements are best-effort summaries;
        authorities remain the source of truth.
      </p>
      <Link className="underline" href="/">
        ← Home
      </Link>
    </article>
  );
}
