import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { prChecklistProgress } from "@/db/schema";
import { publicAppUrl } from "@/lib/app-url";
import { normalizeEmail, hashEmailForDedupe } from "@/lib/email-hash";
import { sendTransactionalEmail } from "@/lib/mail";
import { getPathwayById, getPathwayChecklistIds } from "@/lib/permanent-residence-pathways";
import { generateToken } from "@/lib/tokens";

export const runtime = "nodejs";

function sanitizeChecked(pathwayId: string, checked: unknown): Record<string, boolean> {
  const allowed = getPathwayChecklistIds(pathwayId);
  if (!checked || typeof checked !== "object") return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(checked as Record<string, unknown>)) {
    if (!allowed.has(k)) continue;
    out[k] = Boolean(v);
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim();
  const pathwayId = url.searchParams.get("pathwayId")?.trim();
  if (!token || !pathwayId) {
    return NextResponse.json({ error: "token and pathwayId query params are required" }, { status: 400 });
  }
  if (!getPathwayById(pathwayId)) {
    return NextResponse.json({ error: "Unknown pathway" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(prChecklistProgress)
    .where(eq(prChecklistProgress.accessToken, token))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Progress not found" }, { status: 404 });
  }
  if (row.pathwayId !== pathwayId) {
    return NextResponse.json({ error: "Saved progress belongs to a different pathway" }, { status: 409 });
  }

  return Response.json({
    email: row.email,
    checked: row.checkedJson,
    remindersEnabled: row.remindersEnabled,
    consentPrivacy: row.consentPrivacy,
    consentReminders: row.consentReminders,
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const pathwayId = typeof b.pathwayId === "string" ? b.pathwayId.trim() : "";
  const emailRaw = typeof b.email === "string" ? b.email.trim() : "";
  const remindersEnabled = Boolean(b.remindersEnabled);
  const consentPrivacy = Boolean(b.consentPrivacy);
  const consentReminders = Boolean(b.consentReminders);
  const tokenIn = typeof b.token === "string" ? b.token.trim() : "";
  const checked = sanitizeChecked(pathwayId, b.checked);

  if (!getPathwayById(pathwayId)) {
    return NextResponse.json({ error: "Unknown pathway" }, { status: 400 });
  }
  if (!emailRaw || !emailRaw.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!consentPrivacy) {
    return NextResponse.json({ error: "Privacy consent required to store progress remotely" }, { status: 400 });
  }
  if (remindersEnabled && !consentReminders) {
    return NextResponse.json({ error: "Separate reminder consent required for daily emails" }, { status: 400 });
  }

  const email = normalizeEmail(emailRaw);
  const emailHash = hashEmailForDedupe(email);
  const now = new Date();

  let accessToken = tokenIn;

  if (tokenIn) {
    const existing = await db
      .select()
      .from(prChecklistProgress)
      .where(eq(prChecklistProgress.accessToken, tokenIn))
      .limit(1);
    const row = existing[0];
    if (!row) {
      return NextResponse.json({ error: "Unknown token — save again without token to mint a fresh link" }, { status: 404 });
    }
    if (row.pathwayId !== pathwayId) {
      return NextResponse.json({ error: "Token is registered to another pathway" }, { status: 409 });
    }

    await db
      .update(prChecklistProgress)
      .set({
        email,
        emailHash,
        checkedJson: checked,
        remindersEnabled,
        consentPrivacy,
        consentReminders,
        updatedAt: now,
      })
      .where(eq(prChecklistProgress.accessToken, tokenIn));

    return Response.json({ token: tokenIn, pathwayId, saved: true });
  }

  accessToken = generateToken(24);

  await db.insert(prChecklistProgress).values({
    accessToken,
    email,
    emailHash,
    pathwayId,
    checkedJson: checked,
    remindersEnabled,
    consentPrivacy,
    consentReminders,
    updatedAt: now,
  });

  await sendTransactionalEmail({
    to: email,
    subject: "Keine Bürokratie — save link for your checklist",
    html: `<p>Keep this secure link to restore your checklist:</p><p><a href="${publicAppUrl()}/permanent-residence?pr=${encodeURIComponent(accessToken)}&pathway=${encodeURIComponent(pathwayId)}">Open checklist</a></p><p>You will receive occasional reminders while items stay open if you opted in.</p>`,
    text: `Restore checklist: ${publicAppUrl()}/permanent-residence?pr=${accessToken}&pathway=${pathwayId}`,
  }).catch(() => {});

  return Response.json({ token: accessToken, pathwayId, saved: true });
}
