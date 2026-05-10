import Link from "next/link";
import { Checklist } from "@/components/Checklist";

export default function RegistrationPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold">Moving to Berlin — registration (Anmeldung)</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        After you move in, German residence law normally requires you to{" "}
        <strong>register your address promptly</strong> (often cited as within two weeks for moves within
        Germany — verify current wording on official Berlin pages).
      </p>

      <h2 className="text-xl font-semibold">Official sources</h2>
      <ul className="list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
        <li>
          <a className="underline" href="https://www.berlin.de/en/life/new-in-berlin/744279-8206946-moving-to-berlin-registration-offices.en.html">
            Moving to Berlin — registration offices (Berlin.de overview)
          </a>
        </li>
        <li>
          <a className="underline" href="https://willkommenszentrum.berlin.de/en/housing/registration-residence">
            Willkommenszentrum — registration & residence topics
          </a>
        </li>
        <li>
          Telephone service{" "}
          <a className="underline" href="https://www.berlin.de/life/telephone-services-and-emergency-services/115/">
            115
          </a>{" "}
          can help route you to the right office.
        </li>
      </ul>

      <Checklist
        storageKey="checklist-registration"
        title="Typical preparation checklist (non-exhaustive)"
        items={[
          "Valid ID or passport for everyone registering at the address.",
          "Signed rental or sublet documentation; confirm what your Bürgeramt accepts.",
          "Wohnungsgeberbestätigung (landlord confirmation of move-in) — required in most cases.",
          "Appointment booking or eligible online process (eligibility varies by case).",
          "If applicable, marriage / birth certificates with certified translations — confirm with the office.",
        ]}
      />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This page is summary guidance only. Requirements depend on your nationality, prior residence
        status, household composition, and municipality rules.
      </p>

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
