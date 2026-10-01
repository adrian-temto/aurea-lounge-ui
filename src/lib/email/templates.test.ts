import { describe, expect, it } from "vitest";

import {
  guestPendingEmail,
  guestResponseEmail,
  marketingConfirmEmail,
  staffNewReservationEmail,
  type Booking,
} from "./templates";

const booking: Booking & { email: string } = {
  name: "Mia <b>Weber</b>",
  phone: "+49 170 1234567",
  email: "mia@example.com",
  date: "2026-10-10",
  time: "19:00",
  guests: 2,
  notes: "Fensterplatz\nKinderstuhl",
  locale: "de",
};

describe("reservation emails", () => {
  it("tells the guest the request is pending, in German", () => {
    const e = guestPendingEmail(booking);
    expect(e.to).toBe("mia@example.com");
    expect(e.subject).toBe("Deine Reservierungsanfrage bei Auréa");
    expect(e.text).toContain("Hallo Mia,");
    expect(e.text).toContain("wartet noch auf unsere Bestätigung");
    expect(e.text).toContain("Samstag, 10. Oktober 2026");
    expect(e.text).toContain("19:00 Uhr");
  });

  it("writes in English for guests who booked in English", () => {
    const e = guestPendingEmail({ ...booking, locale: "en" });
    expect(e.subject).toBe("Your reservation request at Auréa");
    expect(e.text).toContain("10 October 2026");
  });

  it("escapes what guests and staff typed", () => {
    const html = guestResponseEmail(booking, "confirmed", "<script>x</script>\nBis bald").html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;x&lt;/script&gt;<br>Bis bald");
    expect(guestPendingEmail(booking).html).toContain("Fensterplatz<br>Kinderstuhl");
    expect(guestPendingEmail(booking).html).not.toContain("<b>Weber</b>");
  });

  it("notifies the team with a link to open requests and the guest as reply-to", () => {
    const e = staffNewReservationEmail(booking, ["team@aurealounge.de"]);
    expect(e.to).toEqual(["team@aurealounge.de"]);
    expect(e.subject).toBe(
      "Neue Reservierungsanfrage: Mia <b>Weber</b>, Sa., 10.10. 19:00, 2 Pers.",
    );
    expect(e.html).toContain("/admin/reservations?status=new");
    expect(e.replyTo).toBe("mia@example.com");
  });

  it("asks for the double opt-in with the link, in the guest's language", () => {
    const link = "https://aurealounge.de/en/angebote/bestaetigen?token=abc";
    const e = marketingConfirmEmail(
      { name: "Jane Doe", email: "jane@example.com", locale: "en" },
      link,
    );
    expect(e.subject).toBe("Please confirm: offers from Auréa by email");
    expect(e.html).toContain(`href="${link}"`);
    expect(e.text).toContain(link);
    expect(e.text).toContain("Hello Jane,");
    expect(e.text).toContain("ignore this email");
  });

  it("links the privacy policy and legal notice in the guest's language", () => {
    const de = guestPendingEmail(booking).html;
    expect(de).toContain('/datenschutz"');
    expect(de).toContain('/impressum"');
    const en = guestPendingEmail({ ...booking, locale: "en" }).html;
    expect(en).toContain('/en/datenschutz"');
    expect(en).toContain('/en/impressum"');
  });
});
