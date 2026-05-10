import Link from "next/link";

export default function ImprintPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold text-foreground">Imprint & contact</h1>
      <p>
        <strong className="text-foreground">Project:</strong> Keine Bürokratie (internal codename for the Berlin
        relocation & immigration companion MVP).
      </p>
      <p>
        <strong className="text-foreground">Contact:</strong> add a monitored inbox / legal entity details here before
        public launch.
      </p>
      <p>
        <strong className="text-foreground">Responsible content notice:</strong> All statements are best-effort
        summaries; authorities remain the source of truth.
      </p>
      <Link className="font-medium text-primary underline decoration-primary/40" href="/">
        ← Home
      </Link>
    </article>
  );
}
