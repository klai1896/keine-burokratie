import Link from "next/link";
import { WatchWizard } from "@/components/WatchWizard";

export default function EinbuergerungstestPage() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Einbürgerungstest (Berlin)</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          The citizenship test is a separate appointment from your naturalisation application. Berlin
          hosts tests at multiple{" "}
          <strong>VHS (Volkshochschule) locations</strong>. You typically book a registration
          appointment first, pay the fee, then sit the test on another day.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            Official service:{" "}
            <a className="underline" href="https://service.berlin.de/dienstleistung/351180/">
              Einbürgerung — Zum Einbürgerungstest anmelden
            </a>
          </li>
          <li>Fee mentioned on the service page (commonly around €25 — confirm on Service Berlin).</li>
          <li>Bring valid ID and any participant form required by the VHS you select.</li>
        </ul>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Optional slot watch (MVP)</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          This tool polls <strong>only</strong> on Berlin weekdays (Mon–Fri) from{" "}
          <strong>07:00 Europe/Berlin</strong>, at a target cadence of about one minute per campus
          (with backoff if the upstream site errors). You get an email and/or desktop notification
          when a matching slot may appear — you still complete booking yourself on Service Berlin.
        </p>
        <WatchWizard />
      </section>

      <Link className="text-sm underline" href="/">
        ← Journey hub
      </Link>
    </article>
  );
}
