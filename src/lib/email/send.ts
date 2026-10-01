/**
 * Sends one email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 *
 * Needs RESEND_API_KEY and EMAIL_FROM, an address on a domain verified in Resend, e.g.
 * "Auréa <reservierung@aurealounge.de>". Without them nothing is sent and the result says so,
 * so bookings keep working while email is being set up.
 */
export type Email = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | undefined;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(email: Email): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from)
    return {
      ok: false,
      error: "E-Mail-Versand ist nicht eingerichtet (RESEND_API_KEY / EMAIL_FROM).",
    };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !body.id)
      return { ok: false, error: body.message ?? `Resend antwortete mit ${res.status}.` };
    return { ok: true, id: body.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler beim Senden." };
  }
}

/** Team inbox(es) for new-booking notifications: RESERVATION_NOTIFY_EMAIL, comma-separated. */
export const staffInboxes = () =>
  (process.env.RESERVATION_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Where guests' replies go; falls back to the first team inbox. */
export const replyToAddress = () => process.env.EMAIL_REPLY_TO || staffInboxes()[0];
