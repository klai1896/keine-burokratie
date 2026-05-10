"use client";

import { useEffect, useMemo, useState } from "react";

export type ServiceTargetRow = { id: string; labelEn: string; officialUrl: string; slug: string };

export type WatchWizardProps = {
  /** When set, skips loading `/api/service-targets` and uses these rows (e.g. parent already fetched). */
  targets?: ServiceTargetRow[];
  /** Controlled selected `service_target` id; pair with `onSelectedTargetIdChange` from a parent picker. */
  selectedTargetId?: string;
  onSelectedTargetIdChange?: (id: string) => void;
};

const weekdayDefs: { value: number; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function WatchWizard(props: WatchWizardProps = {}) {
  const { targets: targetsProp, selectedTargetId, onSelectedTargetIdChange } = props;
  const [fetchedTargets, setFetchedTargets] = useState<ServiceTargetRow[]>([]);
  const [email, setEmail] = useState("");
  const [localServiceTargetId, setLocalServiceTargetId] = useState("");
  const [allowed, setAllowed] = useState<number[]>([1, 2, 3, 4, 5]);
  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(true);
  const [mode, setMode] = useState<"email_only" | "browser_session" | "browser_session_and_email">(
    "email_only",
  );
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentNotifications, setConsentNotifications] = useState(false);
  const [consentBrowser, setConsentBrowser] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [fetchTargetError, setFetchTargetError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const loading = useMemo(() => status === "loading", [status]);

  const effectiveTargets = targetsProp ?? fetchedTargets;
  const serviceTargetId = selectedTargetId ?? localServiceTargetId;
  const setServiceTargetId = onSelectedTargetIdChange ?? setLocalServiceTargetId;

  const displayError = actionError ?? (targetsProp === undefined ? fetchTargetError : null);

  useEffect(() => {
    if (targetsProp !== undefined) return;
    void fetch("/api/service-targets")
      .then((r) => r.json())
      .then((j: { targets?: ServiceTargetRow[] }) => {
        setFetchedTargets(j.targets ?? []);
        setFetchTargetError(null);
        if (j.targets?.[0] && selectedTargetId === undefined) setLocalServiceTargetId(j.targets[0].id);
      })
      .catch(() => setFetchTargetError("Could not load campus list."));
  }, [targetsProp, selectedTargetId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceTargetId || effectiveTargets.length === 0) {
      setActionError("Pick a VHS location with available data (seed the DB or reload).");
      return;
    }
    setActionError(null);
    setStatus("loading");
    const res = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        serviceTargetId: serviceTargetId || undefined,
        allowedWeekdays: allowed,
        allowMorning: morning,
        allowAfternoon: afternoon,
        notificationMode: mode,
        consentPrivacy,
        consentNotifications,
        consentBrowserNotifications: consentBrowser,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(null);
      setActionError(
        typeof body?.errors === "object" ? JSON.stringify(body.errors) : body?.error ?? res.statusText,
      );
      return;
    }
    setStatus("sent");
  }

  function toggleDay(d: number) {
    setAllowed((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d).sort((a, b) => a - b) : [...prev, d].sort((a, b) => a - b),
    );
  }

  const needsBrowser = mode === "browser_session" || mode === "browser_session_and_email";

  const canPickCampus = effectiveTargets.length > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        Start with your email, then pick a VHS location and the days and time bands that match the
        official “Wunschtage / Vor- & Nachmittags” step. We only poll on Berlin workdays Monday–Friday from
        07:00 (local time), per product spec.
      </p>

      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">VHS sub-location</span>
        <select
          className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 disabled:opacity-60"
          value={canPickCampus ? serviceTargetId : ""}
          onChange={(e) => setServiceTargetId(e.target.value)}
          required={canPickCampus}
          disabled={!canPickCampus}
        >
          {!canPickCampus ? (
            <option value="">No campuses loaded yet</option>
          ) : (
            effectiveTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.labelEn}
              </option>
            ))
          )}
        </select>
        <span className="mt-1 block text-xs text-zinc-500">
          Official booking entry:{" "}
          <a className="underline" href="https://service.berlin.de/dienstleistung/351180/">
            Service Berlin — Einbürgerungstest
          </a>
        </span>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Requested weekdays (Monday–Saturday)</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {weekdayDefs.map((d) => (
            <label key={d.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowed.includes(d.value)} onChange={() => toggleDay(d.value)} />
              {d.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Time bands (Berlin local)</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={morning} onChange={(e) => setMorning(e.target.checked)} />
          Morning (07:00–13:00)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={afternoon} onChange={(e) => setAfternoon(e.target.checked)} />
          Afternoon (13:00–19:00)
        </label>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Notification mode</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="mode" checked={mode === "email_only"} onChange={() => setMode("email_only")} />
          Email only — you can close this tab after confirmation
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="mode"
            checked={mode === "browser_session"}
            onChange={() => setMode("browser_session")}
          />
          Keep page open — desktop browser notifications (requires permission)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="mode"
            checked={mode === "browser_session_and_email"}
            onChange={() => setMode("browser_session_and_email")}
          />
          Browser notifications and email
        </label>
      </fieldset>

      <div className="space-y-2 text-sm">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={consentPrivacy}
            onChange={(e) => setConsentPrivacy(e.target.checked)}
          />
          <span>I understand this is a non-official helper and I consent to the privacy policy.</span>
        </label>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={consentNotifications}
            onChange={(e) => setConsentNotifications(e.target.checked)}
          />
          <span>I want transactional emails about this watch (confirm, matches, manage links).</span>
        </label>
        <label className={`flex items-start gap-2 ${needsBrowser ? "" : "opacity-50"}`}>
          <input
            type="checkbox"
            checked={consentBrowser}
            disabled={!needsBrowser}
            onChange={(e) => setConsentBrowser(e.target.checked)}
          />
          <span>
            I consent to device notifications for this browser session (only required for “keep page
            open” modes).
          </span>
        </label>
      </div>

      {displayError ? <p className="text-sm text-red-700 dark:text-red-300">{displayError}</p> : null}
      {status === "sent" ? (
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Check your inbox to confirm the watch. Until you confirm, no polling is active.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !canPickCampus}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
      >
        {loading ? "Sending…" : "Create watch"}
      </button>
    </form>
  );
}
