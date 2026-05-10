import { Resend } from "resend";

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ id?: string; mock?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[mail:mock]", opts.to, opts.subject);
    return { mock: true };
  }
  try {
    const resend = new Resend(key);
    const domain = process.env.RESEND_FROM_DOMAIN ?? "onboarding.resend.dev";
    const from = process.env.RESEND_FROM ?? `Keine Bürokratie <notifications@${domain}>`;
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (error) return { error: error.message };
    return { id: data?.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
