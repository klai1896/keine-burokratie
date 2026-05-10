import Link from "next/link";
import { EinbuergerungstestPanel } from "@/components/EinbuergerungstestPanel";

export default function EinbuergerungstestPage() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Einbürgerungstest (Berlin)</h1>
      </div>

      <EinbuergerungstestPanel
        intro={
          <>
            <p>
              The citizenship test is a separate appointment from your naturalisation application. Berlin hosts tests
              at multiple <strong>VHS (Volkshochschule) locations</strong>. You typically book a registration
              appointment first, pay the fee, then sit the test on another day.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>
                Umbrella Service Berlin entry:{" "}
                <a className="underline" href="https://service.berlin.de/dienstleistung/351180/">
                  Einbürgerung — Zum Einbürgerungstest anmelden
                </a>
              </li>
              <li>Confirm the fee and forms on that page (often around €25 — verify there).</li>
              <li>Bring valid ID and any participant paperwork your VHS requires.</li>
            </ul>
          </>
        }
      />

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
