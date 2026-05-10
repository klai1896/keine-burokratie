import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { serviceTarget, watch, watchLocation } from "@/db/schema";
import { sendTransactionalEmail } from "@/lib/mail";
import { publicAppUrl } from "@/lib/app-url";
import { hashEmailForDedupe, normalizeEmail } from "@/lib/email-hash";
import { generateToken, hashToken } from "@/lib/tokens";
import { parseCreateWatchBody } from "@/lib/watch-validation";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseCreateWatchBody(json);
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  }
  const v = parsed.value;

  const targetRows = await db
    .select()
    .from(serviceTarget)
    .where(and(inArray(serviceTarget.id, v.serviceTargetIds), eq(serviceTarget.active, true)));

  if (targetRows.length !== v.serviceTargetIds.length) {
    return NextResponse.json({ error: "Unknown or inactive service target in selection" }, { status: 400 });
  }

  const confirmToken = generateToken();
  const manageToken = generateToken();

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(watch)
      .values({
        email: normalizeEmail(v.email),
        emailHash: hashEmailForDedupe(v.email),
        allowedWeekdays: v.allowedWeekdays,
        allowMorning: v.allowMorning,
        allowAfternoon: v.allowAfternoon,
        notificationMode: v.notificationMode,
        status: "pending_confirm",
        confirmTokenHash: hashToken(confirmToken),
        manageTokenHash: hashToken(manageToken),
      })
      .returning({ id: watch.id });

    if (!row) throw new Error("watch insert failed");

    await tx.insert(watchLocation).values(
      v.serviceTargetIds.map((serviceTargetId) => ({
        watchId: row.id,
        serviceTargetId,
      })),
    );

    return row;
  });

  const base = publicAppUrl();
  const confirmUrl = `${base}/api/watches/confirm?token=${encodeURIComponent(confirmToken)}`;

  const mail = await sendTransactionalEmail({
    to: v.email,
    subject: "Confirm your Einbürgerungstest slot watch",
    html: `<p>Please confirm your email to activate the watch.</p><p><a href="${confirmUrl}">Confirm</a></p><p>Manage / cancel link will be available after confirmation.</p>`,
    text: `Confirm: ${confirmUrl}`,
  });
  if (mail.error) {
    console.error("mail error", mail.error);
  }

  return NextResponse.json(
    { watchId: created.id, status: "pending_confirm", emailDispatch: mail.mock ? "mock" : "sent" },
    { status: 201 },
  );
}
