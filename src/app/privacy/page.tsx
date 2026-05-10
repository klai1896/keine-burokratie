import Link from "next/link";

export default function PrivacyPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      <h1 className="text-2xl font-semibold">Privacy</h1>
      <p>
        Keine Bürokratie processes the minimum data needed to run the MVP: email addresses for
        transactional messages, preference selections for watchers, hashed tokens for confirmation and
        management links, server logs for operations, and (when you grant it) desktop notification
        permissions in your browser for the optional “keep page open” mode.
      </p>
      <p>
        We do not intend to profile you beyond operating the watch and exam directory features. Raw
        notification events for browser mode are delivered without passport data in the payload.
      </p>
      <p>
        Public pages ingest third-party booking pages (telc/Goethe) on a schedule; please review those
        providers’ privacy policies before you submit personal data on their sites.
      </p>
      <p>
        Replace this stub with counsel-approved wording before production processing of personal data.
      </p>
      <Link className="underline" href="/">
        ← Home
      </Link>
    </article>
  );
}
