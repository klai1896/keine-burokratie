import Link from "next/link";
import { Checklist } from "@/components/Checklist";

export default function CitizenshipPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold">German citizenship (Naturalisation)</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        Citizenship decisions depend on residence history, income, language, integration, and other
        statutory tests. Berlin processes much of this through LEA and official online entry points.
        Use the links below as orientation, then follow the official questionnaire and application
        workflow.
      </p>

      <h2 className="text-xl font-semibold">Official entry points</h2>
      <ul className="list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
        <li>
          <a className="underline" href="https://service.berlin.de/dienstleistung/318998">
            Citizenship application — Service Berlin service page
          </a>
        </li>
        <li>
          <a className="underline" href="https://www.einbuergerung.de/fragebogen.php">
            Federal questionnaire (orientation)
          </a>
        </li>
        <li>
          <a className="underline" href="https://service.berlin.de/dienstleistung/351180/">
            Einbürgerungstest — register for the citizenship test (Berlin VHS locations)
          </a>{" "}
          — availability changes quickly; consider the{" "}
          <Link className="underline" href="/einbuergerungstest">
            slot helper
          </Link>{" "}
          (notify-only, no auto-booking).
        </li>
      </ul>

      <Checklist
        storageKey="checklist-citizenship"
        title="Common evidence categories (verify for your case)"
        items={[
          "Lawful habitual residence evidence for the required period.",
          "Stable livelihood / insurance where required.",
          "Language certificates (often B1 or stronger — confirm your pathway).",
          "Criminal record certificates (Einwohnermeldeamt / federal where applicable).",
          "Passport / foreign citizenship documentation and renunciation steps if needed.",
        ]}
      />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This site does not provide legal advice. When in doubt, consult a qualified adviser.
      </p>

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
