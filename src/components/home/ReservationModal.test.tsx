import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { ALL, CONSENT_COOKIE, CONSENT_VERSION, serializeConsent } from "@/lib/consent";

import {
  ReservationModalProvider,
  ReserveLink,
  SAVED_CONTACT_KEY,
} from "./ReservationModal";

const createReservation = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/reservations", () => ({ createReservation }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function Page({ locale = "de" }: { locale?: Locale }) {
  return (
    <I18nProvider locale={locale}>
      <ConsentProvider>
        <ReservationModalProvider>
          <ReserveLink>Tisch reservieren</ReserveLink>
          <a href="#menu">Karte</a>
        </ReservationModalProvider>
      </ConsentProvider>
    </I18nProvider>
  );
}

function decideCookies() {
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent({
    ...ALL,
    version: CONSENT_VERSION,
    decidedAt: "2026-01-01T00:00:00.000Z",
  })}; Path=/`;
}

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    window.dispatchEvent(new Event("scroll"));
  });
}

const modal = () => screen.queryByRole("dialog", { name: /Tisch reservieren/ });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  scrollTo(0);
  createReservation.mockReset();
});

afterEach(() => vi.useRealTimers());

describe("no automatic prompt", () => {
  beforeEach(decideCookies);

  it("never opens by itself, however far the visitor scrolls", () => {
    render(<Page />);
    expect(modal()).toBeNull();
    for (const y of [60, 240, 700, 3000]) scrollTo(y);
    expect(modal()).toBeNull();
  });
});

describe("reservation buttons", () => {
  beforeEach(decideCookies);

  it("open the modal at any time and return focus when closed", async () => {
    render(<Page />);
    const link = screen.getByRole("link", { name: "Tisch reservieren" });
    await userEvent.click(link);
    expect(modal()).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(modal()).toBeNull();
    expect(link).toHaveFocus();
  });

  it("books at most 8 guests online and points larger groups to the phone", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));

    const options = within(screen.getByLabelText("Personen")).getAllByRole("option");
    expect(options.map((o) => o.getAttribute("value"))).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
    ]);
    expect(screen.getByRole("link", { name: /33204 634887/ })).toHaveAttribute(
      "href",
      "tel:+4933204634887",
    );
  });

  it("ends with optional consents, nothing required, and a privacy notice", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));
    fireEvent.change(screen.getByLabelText("Datum"), { target: { value: "02.05.2099" } });
    await userEvent.click(screen.getByRole("button", { name: "Reservieren" }));

    const form = screen.getByRole("button", { name: "Anfrage senden" }).closest("form")!;
    const link = within(form).getByRole("link", { name: /Datenschutzerklärung/ });
    expect(link).toHaveAttribute("href", "/datenschutz");
    expect(link).toHaveAttribute("target", "_blank");
    const boxes = within(form).getAllByRole("checkbox");
    expect(boxes).toHaveLength(2);
    // Nothing is pre-ticked and nothing is required: there are no terms to accept.
    expect(boxes.every((b) => !(b as HTMLInputElement).checked)).toBe(true);
    expect(boxes.some((b) => (b as HTMLInputElement).required)).toBe(false);
    expect(within(form).queryByText(/Geschäftsbedingungen/)).toBeNull();
    // The offers box says it only counts after confirming by email (double opt-in).
    expect(within(form).getByRole("checkbox", { name: /Angebote.*Bestätigung/ })).toBeInTheDocument();
    expect(within(form).getByLabelText("E-Mail")).toBeRequired();
  });

  it("sends the request to the reservation action and shows its reply", async () => {
    createReservation.mockResolvedValue({ ok: true, message: "Danke — wir melden uns in Kürze." });
    render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));

    await userEvent.selectOptions(screen.getByLabelText("Personen"), "4");
    fireEvent.change(screen.getByLabelText("Datum"), { target: { value: "02.05.2099" } });
    await userEvent.selectOptions(screen.getByLabelText("Bereich"), "lounge");
    await userEvent.selectOptions(screen.getByLabelText("Uhrzeit"), "20:30");
    await userEvent.click(screen.getByRole("button", { name: "Reservieren" }));

    await userEvent.type(screen.getByLabelText("Name"), "Mila Hoxha");
    await userEvent.type(screen.getByLabelText("Telefon"), "+49 170 1234567");
    await userEvent.type(screen.getByLabelText("E-Mail"), "mila@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));

    expect(await screen.findByText("Danke — wir melden uns in Kürze.")).toBeInTheDocument();
    // Unticked boxes send nothing; "remember" stays on the device.
    const data = createReservation.mock.calls[0]?.[1] as FormData;
    expect(Object.fromEntries(data)).toEqual({
      locale: "de",
      guests: "4",
      date: "2099-05-02",
      time: "20:30",
      seating: "lounge",
      name: "Mila Hoxha",
      phone: "+49 170 1234567",
      email: "mila@example.com",
    });
    expect(localStorage.getItem(SAVED_CONTACT_KEY)).toBeNull();
  });

  it("remembers name, phone and email on this device only when asked to", async () => {
    createReservation.mockResolvedValue({ ok: true, message: "Danke — wir melden uns in Kürze." });
    const { unmount } = render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));
    fireEvent.change(screen.getByLabelText("Datum"), { target: { value: "02.05.2099" } });
    await userEvent.click(screen.getByRole("button", { name: "Reservieren" }));
    await userEvent.type(screen.getByLabelText("Name"), "Mila Hoxha");
    await userEvent.type(screen.getByLabelText("Telefon"), "+49 170 1234567");
    await userEvent.type(screen.getByLabelText("E-Mail"), "mila@example.com");
    await userEvent.click(screen.getByRole("checkbox", { name: /nächsten Reservierungen/ }));
    await userEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));
    await screen.findByText("Danke — wir melden uns in Kürze.");

    expect(JSON.parse(localStorage.getItem(SAVED_CONTACT_KEY)!)).toEqual({
      name: "Mila Hoxha",
      phone: "+49 170 1234567",
      email: "mila@example.com",
    });
    unmount();
    sessionStorage.clear();

    render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));
    fireEvent.change(screen.getByLabelText("Datum"), { target: { value: "02.05.2099" } });
    await userEvent.click(screen.getByRole("button", { name: "Reservieren" }));
    const form = screen.getByRole("button", { name: "Anfrage senden" }).closest("form")!;
    expect(within(form).getByLabelText("E-Mail")).toHaveValue("mila@example.com");
    expect(within(form).getByLabelText("Telefon")).toHaveValue("+49 170 1234567");
    expect(within(form).getByRole("checkbox", { name: /nächsten Reservierungen/ })).toBeChecked();
  });

  it("keeps the form open with the server's message when booking fails", async () => {
    createReservation.mockResolvedValue({
      ok: false,
      message: "Das Datum liegt in der Vergangenheit.",
    });
    render(<Page />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));
    fireEvent.change(screen.getByLabelText("Datum"), { target: { value: "02.05.2099" } });
    await userEvent.click(screen.getByRole("button", { name: "Reservieren" }));
    await userEvent.type(screen.getByLabelText("Name"), "Mila");
    await userEvent.type(screen.getByLabelText("Telefon"), "12345");
    await userEvent.type(screen.getByLabelText("E-Mail"), "mila@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Anfrage senden" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Das Datum liegt in der Vergangenheit.",
    );
    expect(screen.getByRole("button", { name: "Anfrage senden" })).toBeInTheDocument();
  });
});

describe("in English", () => {
  beforeEach(decideCookies);

  it("walks through the same booking in English and asks the server to reply in English", async () => {
    createReservation.mockResolvedValue({
      ok: true,
      message: "Thank you — we'll be in touch shortly.",
    });
    render(<Page locale="en" />);
    await userEvent.click(screen.getByRole("link", { name: "Tisch reservieren" }));

    const dialog = screen.getByRole("dialog", { name: /Reserve a table/ });
    expect(within(dialog).getByText("Choose guests, date and time.")).toBeInTheDocument();
    const guests = screen.getByLabelText("Guests");
    expect(
      within(guests)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toContain("1 guest");
    expect(screen.getByLabelText("Area")).toHaveTextContent("No preference");
    expect(screen.getByRole("link", { name: /33204 634887/ }).parentElement).toHaveTextContent(
      "More than 8 guests? Give us a call:",
    );

    await userEvent.selectOptions(guests, "3");
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "02.05.2099" } });
    await userEvent.selectOptions(screen.getByLabelText("Time"), "12:00");
    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    // The selections carry over to the second step unchanged.
    expect(screen.getByText("3 guests")).toBeInTheDocument();
    expect(screen.getByText("12:00")).toBeInTheDocument();
    // The privacy policy exists in English too, so English visitors get it.
    const privacy = screen.getByRole("link", { name: /^privacy policy/ });
    expect(privacy).toHaveAttribute("href", "/en/datenschutz");
    expect(privacy).not.toHaveAttribute("hreflang");

    await userEvent.type(screen.getByLabelText("Name"), "Mila Hoxha");
    await userEvent.type(screen.getByLabelText("Phone"), "+49 170 1234567");
    await userEvent.type(screen.getByLabelText("Email"), "mila@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    expect(await screen.findByText("Thank you — we'll be in touch shortly.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Request sent/ })).toBeInTheDocument();
    const data = Object.fromEntries(createReservation.mock.calls[0]?.[1] as FormData);
    expect(data).toMatchObject({ locale: "en", guests: "3", date: "2099-05-02", time: "12:00" });
  });
});
