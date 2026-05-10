"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function Inner() {
  const sp = useSearchParams();
  const watchId = sp.get("watchId");
  const manageToken = sp.get("manageToken");
  const mode = sp.get("mode") ?? "";
  const wantsBrowser =
    mode === "browser_session" || mode === "browser_session_and_email";
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!watchId || !manageToken || !wantsBrowser) return;
    if (!("Notification" in window)) return;
    const qs = new URLSearchParams({ manageToken });
    const es = new EventSource(`/api/watches/${watchId}/stream?${qs.toString()}`);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as { type?: string; openUrl?: string };
        setLog((prev) => [...prev, msg.type ?? "message"]);
        if (msg.type === "slot_available") {
          if (typeof window !== "undefined" && Notification.permission === "granted") {
            void new Notification("Slot may be available", {
              body: "Open the booking flow on Service Berlin to verify and book.",
              data: { url: msg.openUrl },
            });
          }
        }
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      setLog((prev) => [...prev, "stream-error"]);
    };
    return () => es.close();
  }, [watchId, manageToken, wantsBrowser]);

  async function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    await Notification.requestPermission();
  }

  async function cancel() {
    if (!watchId || !manageToken) return;
    await fetch(`/api/watches/${watchId}/cancel?manageToken=${encodeURIComponent(manageToken)}`, {
      method: "POST",
    });
    window.location.href = "/einbuergerungstest?info=cancelled";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Watch activated</h1>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        If you chose a “keep page open” mode, grant notification permission below and keep this tab
        open while you work. Email notifications still work if you close the tab (when enabled).
      </p>

      {!watchId || !manageToken ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Missing link parameters — open this page from your confirmation redirect or email manage link.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              onClick={() => void requestNotificationPermission()}
            >
              Request notification permission
            </button>
            <button
              type="button"
              className="rounded border border-red-400 px-3 py-2 text-sm text-red-800 dark:border-red-700 dark:text-red-200"
              onClick={() => void cancel()}
            >
              Stop this watch
            </button>
          </div>

          <p className="text-xs text-zinc-500">
            SSE debug:{" "}
            {log.slice(-8).join(" · ") ||
              "listening — polling runs only Mon–Fri from 07:00 Berlin local time"}
          </p>
        </>
      )}

      <Link className="text-sm underline" href="/">
        ← Back home
      </Link>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-600">Loading…</p>}>
      <Inner />
    </Suspense>
  );
}
