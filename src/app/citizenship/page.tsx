import Link from "next/link";
import { Checklist } from "@/components/Checklist";
import { EinbuergerungstestPanel } from "@/components/EinbuergerungstestPanel";

export default function CitizenshipPage() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-semibold">German citizenship (Naturalisation)</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        Citizenship depends on residence history, income, language, integration course completion, and other statutory
        tests. Follow the questionnaire and checklist that match your nationality and residence chain — Berlin routes
        most applications through Service Berlin plus LEA tooling.
      </p>

      <h2 className="text-xl font-semibold">Start with these official anchors</h2>
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
      </ul>

      <Checklist
        storageKey="checklist-citizenship"
        title="Common evidence categories (verify for your case)"
        items={[
          "Lawful habitual residence evidence for the required period.",
          "Stable livelihood / insurance where required.",
          "Language certificates (often B1 or stronger — confirm your pathway).",
          "Criminal record certificates (Meldeämter / federal where applicable).",
          "Passport / foreign citizenship documentation and renunciation steps if needed.",
        ]}
      />

      <EinbuergerungstestPanel
        compactIntro={
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Citizenship test appointments</h2>
            <p>
              Booking the Einbürgerungstest is easiest through Service Berlin&apos;s VHS sub-locations below. Availability
              changes quickly — pick a campus, open the deep link we store for that site, then optionally activate the
              email/Browser notifier on the same page.
            </p>
          </div>
        }
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
