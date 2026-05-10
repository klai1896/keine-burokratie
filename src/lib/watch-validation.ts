export type CreateWatchBody = {
  email: string;
  serviceTargetIds: string[];
  allowedWeekdays: number[];
  allowMorning: boolean;
  allowAfternoon: boolean;
  notificationMode: "email_only" | "browser_session" | "browser_session_and_email";
  consentPrivacy: boolean;
  consentNotifications: boolean;
  consentBrowserNotifications: boolean;
};

export type ValidationResult =
  | { ok: true; value: CreateWatchBody }
  | { ok: false; errors: Record<string, string> };

/** ISO-ish: Mon = 1 … Sat = 6 (Sunday excluded for MVP UX). */
function validWeekdays(w: unknown): number[] | null {
  if (!Array.isArray(w)) return null;
  const nums = w.map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  for (const n of nums) {
    if (n < 1 || n > 6) return null;
  }
  return [...new Set(nums)].sort((a, b) => a - b);
}

function coerceServiceTargetIds(body: Record<string, unknown>): string[] {
  const raw = body.serviceTargetIds;
  if (Array.isArray(raw) && raw.length > 0) {
    return [...new Set(raw.map((x) => String(x).trim()).filter((x) => x.length >= 32))];
  }
  const legacy =
    typeof body.serviceTargetId === "string" && body.serviceTargetId.trim().length >= 32
      ? body.serviceTargetId.trim()
      : "";
  return legacy ? [legacy] : [];
}

export function parseCreateWatchBody(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  if (!body || typeof body !== "object") {
    return { ok: false, errors: { _root: "Invalid JSON body" } };
  }
  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email required";

  const serviceTargetIds = coerceServiceTargetIds(b);
  if (serviceTargetIds.length === 0) {
    errors.serviceTargetIds = "Select at least one VHS location";
  }
  const allowedWeekdays = validWeekdays(b.allowedWeekdays);
  if (!allowedWeekdays) errors.allowedWeekdays = "Select at least Mon–Sat (1–6)";

  const allowMorning = Boolean(b.allowMorning);
  const allowAfternoon = Boolean(b.allowAfternoon);
  if (!allowMorning && !allowAfternoon) {
    errors.timeBand = "Select morning and/or afternoon";
  }

  const mode = b.notificationMode;
  const notificationMode =
    mode === "email_only" || mode === "browser_session" || mode === "browser_session_and_email"
      ? mode
      : null;
  if (!notificationMode) errors.notificationMode = "Invalid notification mode";

  if (!b.consentPrivacy) errors.consentPrivacy = "Privacy consent required";
  if (!b.consentNotifications) errors.consentNotifications = "Notification consent required";

  const consentBrowserNotifications = Boolean(b.consentBrowserNotifications);
  const needsBrowser =
    notificationMode === "browser_session" || notificationMode === "browser_session_and_email";
  if (needsBrowser && !consentBrowserNotifications) {
    errors.consentBrowserNotifications =
      "Consent required when using “keep page open” / browser notifications";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      email,
      serviceTargetIds,
      allowedWeekdays: allowedWeekdays!,
      allowMorning,
      allowAfternoon,
      notificationMode: notificationMode!,
      consentPrivacy: true,
      consentNotifications: true,
      consentBrowserNotifications,
    },
  };
}
