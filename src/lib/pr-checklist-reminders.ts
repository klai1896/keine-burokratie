import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { prChecklistProgress } from "@/db/schema";
import { sendTransactionalEmail } from "@/lib/mail";
import { getPathwayById } from "@/lib/permanent-residence-pathways";
import { publicAppUrl } from "@/lib/app-url";

const MIN_HOURS_BETWEEN = Number(process.env.PR_REMINDER_MIN_HOURS ?? 20);

function hoursSince(date: Date | null): number {
  if (!date) return Infinity;
  return (Date.now() - date.getTime()) / (3600 * 1000);
}

/**
 * Sends at most one digest email per qualifying row inside the throttle window (default 20h).
 * Intended to run from the polling worker occasionally — cheap enough to call each tick while data volume is tiny.
 */
export async function deliverPrReminderDigest(): Promise<{ sent: number; skipped: number }> {
  const rows = await db.select().from(prChecklistProgress).where(eq(prChecklistProgress.remindersEnabled, true));

  let sent = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.consentPrivacy || !row.consentReminders) {
      skipped++;
      continue;
    }
    if (hoursSince(row.lastReminderAt) < MIN_HOURS_BETWEEN) {
      skipped++;
      continue;
    }

    const pathway = getPathwayById(row.pathwayId);
    if (!pathway) {
      skipped++;
      continue;
    }

    const open = pathway.checklist
      .map((item) => ({ item, done: Boolean(row.checkedJson[item.id]) }))
      .filter((x) => !x.done);

    const base = publicAppUrl();
    const resume = `${base}/permanent-residence?pr=${encodeURIComponent(row.accessToken)}&pathway=${encodeURIComponent(row.pathwayId)}`;

    if (open.length === 0) {
      await sendTransactionalEmail({
        to: row.email,
        subject: "Keine Bürokratie — settlement checklist looks complete",
        html: `<p>We could not find any open items on your saved <strong>${pathway.title}</strong> checklist.</p><p>If you toggled reminders on by mistake you can reopen the checklist and disable them.</p><p><a href="${resume}">Open checklist</a></p>`,
        text: `Checklist pathway ${pathway.title}: all tracked items marked done — ${resume}`,
      });
    } else {
      const bullets = open
        .slice(0, 25)
        .map(({ item }) => `<li>${item.label}</li>`)
        .join("");
      await sendTransactionalEmail({
        to: row.email,
        subject: `Keine Bürokratie — ${open.length} open settlement task(s)`,
        html: `<p>Reminder: you still have <strong>${open.length}</strong> open item(s) for <strong>${pathway.title}</strong>.</p><ol>${bullets}</ol>${open.length > 25 ? `<p>…and more inside the tool.</p>` : ""}<p><a href="${resume}">Update progress</a></p>`,
        text: `${open.length} open items (${pathway.title}) — ${resume}`,
      });
    }

    await db
      .update(prChecklistProgress)
      .set({ lastReminderAt: new Date() })
      .where(eq(prChecklistProgress.id, row.id));
    sent++;
  }

  if (sent) {
    console.info("[pr-reminders] dispatched", sent, "skipped", skipped);
  }
  return { sent, skipped };
}
