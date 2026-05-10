"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PermanentResidenceChecklistItem } from "@/lib/permanent-residence-pathways";

const lsKey = (pathwayId: string) => `pr_access_token:${pathwayId}`;

type Props = {
  pathwayId: string;
  title: string;
  items: PermanentResidenceChecklistItem[];
};

export function PrTrackableChecklist({ pathwayId, title, items }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentReminders, setConsentReminders] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  const resumeUrl = useMemo(() => {
    if (!token || typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.pathname = "/permanent-residence";
    u.search = "";
    u.searchParams.set("pr", token);
    u.searchParams.set("pathway", pathwayId);
    return u.toString();
  }, [token, pathwayId]);

  const hydrateFromServer = useCallback(
    async (t: string) => {
      setLoadingRemote(true);
      setError(null);
      try {
        const r = await fetch(`/api/pr-checklist?token=${encodeURIComponent(t)}&pathwayId=${encodeURIComponent(pathwayId)}`);
        const body = (await r.json().catch(() => ({}))) as Record<string, unknown>;
        if (!r.ok) {
          setError(typeof body?.error === "string" ? body.error : "Could not load saved checklist");
          return;
        }
        setEmail(typeof body.email === "string" ? body.email : "");
        setChecked((body.checked as Record<string, boolean>) ?? {});
        setRemindersEnabled(Boolean(body.remindersEnabled));
        setConsentPrivacy(Boolean(body.consentPrivacy));
        setConsentReminders(Boolean(body.consentReminders));
        setToken(t);
        try {
          localStorage.setItem(lsKey(pathwayId), t);
        } catch {
          /* ignore */
        }
      } finally {
        setLoadingRemote(false);
      }
    },
    [pathwayId],
  );

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setError(null);
      setStatus(null);
      try {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get("pr");
        const fromLs = localStorage.getItem(lsKey(pathwayId));
        const preferred = fromUrl?.trim() || fromLs?.trim();
        if (preferred) {
          void hydrateFromServer(preferred);
          return;
        }
      } catch {
        /* ignore */
      }
      setChecked({});
      setEmail("");
      setRemindersEnabled(false);
      setConsentPrivacy(false);
      setConsentReminders(false);
      setToken(null);
    });

    return () => {
      cancelled = true;
    };
  }, [pathwayId, hydrateFromServer]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    if (!consentPrivacy) {
      setError("Please confirm privacy consent so we know we may store your email and checklist remotely.");
      return;
    }
    if (remindersEnabled && !consentReminders) {
      setError("Please confirm reminder consent to receive checklist emails.");
      return;
    }
    try {
      const res = await fetch("/api/pr-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          pathwayId,
          email,
          checked,
          remindersEnabled,
          consentPrivacy,
          consentReminders,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok) {
        setError(typeof body?.error === "string" ? body.error : "Save failed");
        return;
      }
      const nextTok = typeof body.token === "string" ? body.token : token;
      if (nextTok) {
        setToken(nextTok);
        try {
          localStorage.setItem(lsKey(pathwayId), nextTok);
        } catch {
          /* ignore */
        }
      }
      setStatus("Saved. Check your inbox for a secure reopen link.");
    } catch {
      setError("Network error saving checklist.");
    }
  }

  return (
    <section className="mt-8 space-y-4 rounded-xl border border-border bg-gradient-card p-4 text-card-foreground shadow-soft">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Tick boxes while you assemble documents — nothing here replaces Berlin’s mandatory PDF checklists for your
          service number.
        </p>
      </div>

      {loadingRemote ? <p className="text-xs text-muted-foreground">Loading saved checklist…</p> : null}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2">
            <input
              type="checkbox"
              id={item.id}
              className="mt-1 size-4 shrink-0 rounded border-border text-primary"
              checked={Boolean(checked[item.id])}
              onChange={(e) =>
                setChecked((prev) => ({
                  ...prev,
                  [item.id]: e.target.checked,
                }))
              }
            />
            <label htmlFor={item.id} className="text-sm leading-relaxed">
              <span className="text-foreground">{item.label}</span>
              {item.detail ? (
                <span className="mt-1 block text-muted-foreground">
                  {" "}
                  {item.detail}
                </span>
              ) : null}
              {item.links?.length ? (
                <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
                  {item.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline decoration-primary/35"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </span>
              ) : null}
            </label>
          </li>
        ))}
      </ul>

      <form onSubmit={onSave} className="space-y-3 rounded-lg border border-dashed border-border/80 bg-card/70 p-3">
        <p className="text-sm font-medium text-foreground">Save remotely & reminders</p>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Email for recovery & reminders
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@domain.com"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={consentPrivacy}
            onChange={(e) => setConsentPrivacy(e.target.checked)}
          />
          <span>
            I consent to Keine Bürokratie storing this checklist and my email securely for recovery (non-government
            helper — see Privacy).
          </span>
        </label>

        <label className={`flex items-start gap-2 text-xs ${consentPrivacy ? "text-muted-foreground" : "opacity-60"}`}>
          <input
            type="checkbox"
            disabled={!consentPrivacy}
            checked={remindersEnabled}
            onChange={(e) => setRemindersEnabled(e.target.checked)}
          />
          <span>
            Email me about once per day while items stay open (~20-hour minimum gap between mails on our server).
          </span>
        </label>

        <label
          className={`flex items-start gap-2 text-xs ${remindersEnabled ? "text-muted-foreground" : "opacity-60"}`}
        >
          <input
            type="checkbox"
            disabled={!remindersEnabled}
            checked={consentReminders}
            onChange={(e) => setConsentReminders(e.target.checked)}
          />
          <span>I agree to transactional reminder emails about incomplete checklist rows.</span>
        </label>

        {resumeUrl ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Reopen link:</span>{" "}
            <a className="break-all font-medium text-primary underline decoration-primary/40" href={resumeUrl}>
              {resumeUrl}
            </a>
          </p>
        ) : null}

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
        >
          Save checklist & preferences
        </button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {status ? <p className="text-sm text-primary">{status}</p> : null}
      </form>
    </section>
  );
}
