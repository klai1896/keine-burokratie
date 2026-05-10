"use client";

import { useEffect, useMemo, useState } from "react";

export type ServiceTargetRow = { id: string; labelEn: string; officialUrl: string; slug: string };

export type WatchWizardProps = {
  /** When set, skips loading `/api/service-targets` and uses these rows (e.g. parent already fetched). */
  targets?: ServiceTargetRow[];
  selectedTargetIds: string[];
  onSelectedTargetIdsChange: (ids: string[]) => void;
};

const weekdayDefs: { value: number; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function WatchWizard(props: WatchWizardProps) {
  const { targets: targetsProp, selectedTargetIds, onSelectedTargetIdsChange } = props;
  const [fetchedTargets, setFetchedTargets] = useState<ServiceTargetRow[]>([]);
  const [email, setEmail] = useState("");
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

  useEffect(() => {
    if (targetsProp !== undefined) return;
    void fetch("/api/service-targets")
      .then((r) => r.json())
      .then((j: { targets?: ServiceTargetRow[] }) => {
        setFetchedTargets(j.targets ?? []);
        setFetchTargetError(null);
      })
      .catch(() => setFetchTargetError("Could not load campus list."));
  }, [targetsProp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTargetIds.length === 0 || effectiveTargets.length === 0) {
      setActionError("Pick at least one VHS location with available data (seed the DB or reload).");
      return;
    }
    setActionError(null);
    setStatus("loading");
    const res = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        serviceTargetIds: selectedTargetIds,
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

  function toggleLocation(id: string) {
    onSelectedTargetIdsChange(
      selectedTargetIds.includes(id)
        ? selectedTargetIds.filter((x) => x !== id).length > 0
          ? selectedTargetIds.filter((x) => x !== id)
          : selectedTargetIds
        : [...selectedTargetIds, id],
    );
  }

  const needsBrowser = mode === "browser_session" || mode === "browser_session_and_email";

  const canPickCampus = effectiveTargets.length > 0;

  const displayError = actionError ?? (targetsProp === undefined ? fetchTargetError : null);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-xl border border-border bg-card/90 p-4 text-card-foreground shadow-soft backdrop-blur-sm"
    >
      <p className="text-sm text-muted-foreground">
        Start with your email, then choose <strong className="text-foreground">one or more</strong> VHS locations and
        the days and time bands that match the official “Wunschtage / Vor- & Nachmittags” step. We poll on Berlin
        workdays Monday–Friday from <strong className="text-foreground">07:00 (local time)</strong>, per product spec.
      </p>

      <label className="block text-sm">
        <span className="font-medium">Email</span>
        <input
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>

      <fieldset className="space-y-2 text-sm" disabled={!canPickCampus}>
        <legend className="font-medium">VHS sub-locations</legend>
        <p className="text-muted-foreground">
          Multi-select campuses you are willing to travel to — we notify you when any of them matches your preferences.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {effectiveTargets.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2 transition ${
                selectedTargetIds.includes(t.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/35"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedTargetIds.includes(t.id)}
                onChange={() => toggleLocation(t.id)}
              />
              <span>
                <span className="block font-medium text-foreground">{t.labelEn}</span>
                <a
                  className="text-xs font-medium text-primary underline decoration-primary/45"
                  href={t.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open booking on Service Berlin →
                </a>
              </span>
            </label>
          ))}
        </div>
        <span className="block text-xs text-muted-foreground">
          Official umbrella:{" "}
          <a className="font-medium text-primary underline decoration-primary/40" href="https://service.berlin.de/dienstleistung/351180/">
            Service Berlin — Einbürgerungstest
          </a>
        </span>
      </fieldset>

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
            I consent to device notifications for this browser session (only required for “keep page open” modes).
          </span>
        </label>
      </div>

      {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
      {status === "sent" ? (
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          Check your inbox to confirm the watch. Until you confirm, no polling is active.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !canPickCampus || selectedTargetIds.length === 0}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Sending…" : "Create watch"}
      </button>
    </form>
  );
}
