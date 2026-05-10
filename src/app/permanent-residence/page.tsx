import Link from "next/link";
import { Checklist } from "@/components/Checklist";

export default function PermanentResidencePage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold">Permanent residence in Berlin</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        Different pathways (general employment, EU Blue Card, studies, family, etc.) have different
        evidence requirements. Officials often use questionnaires and structured submission flows —
        rely on{" "}
        <a className="underline" href="https://www.berlin.de/einwanderung/en/residence/permanent/">
          Berlin.de / LEA material
        </a>{" "}
        and the specific Service Berlin service page for your permit type.
      </p>

      <h2 className="text-xl font-semibold">Service examples (verify current links)</h2>
      <ul className="list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
        <li>
          <a className="underline" href="https://service.berlin.de/dienstleistung/121864/en/">
            Permanent settlement permit (general) — Service Berlin
          </a>
        </li>
        <li>
          <a className="underline" href="https://service.berlin.de/dienstleistung/326556/standort/121885/en/">
            EU Blue Card — settlement permit — Service Berlin
          </a>
        </li>
      </ul>

      <Checklist
        storageKey="checklist-permanent"
        title="Preparation checklist (general)"
        items={[
          "Identify your current permit type and the correct settlement pathway.",
          "Collect continuity of employment / insurance / pension evidence as required.",
          "Language evidence if your pathway mandates it.",
          "Book appointments or online submission slots if offered for your route.",
          "Renew passports early if your appointment is months away.",
        ]}
      />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Rules change; always cross-check timelines, eligibility, and document lists on Berlin.de and Service
        Berlin before you act.
      </p>

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
