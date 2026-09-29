import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ALL,
  CONSENT_COOKIE,
  CONSENT_VERSION,
  browser,
  parseConsent,
  readConsent,
  serializeConsent,
} from "@/lib/consent";

import { ConsentGate } from "./ConsentGate";
import { ConsentProvider } from "./ConsentProvider";
import { CookieSettingsButton } from "./CookieSettingsButton";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function Site() {
  return (
    <ConsentProvider>
      <main>
        <form aria-label="Reservierung">
          <button type="submit">Anfrage senden</button>
        </form>
        <ConsentGate category="analytics">
          {/* eslint-disable-next-line @next/next/no-sync-scripts -- stand-in for a real tracker */}
          <script data-testid="analytics-script" src="https://analytics.example/tag.js" />
        </ConsentGate>
        <ConsentGate category="media" placeholder="Beispiel Maps">
          <iframe data-testid="map-embed" title="Karte" src="https://maps.example/embed" />
        </ConsentGate>
        <footer>
          <CookieSettingsButton />
        </footer>
      </main>
    </ConsentProvider>
  );
}

function setCookie(choices: typeof ALL, version = CONSENT_VERSION) {
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent({
    ...choices,
    version,
    decidedAt: "2026-01-01T00:00:00.000Z",
  })}; Path=/`;
}

const modalTitle = () =>
  screen.queryByRole("heading", { name: /Cookies & Dienste|Cookie-Einstellungen/ });
const footerSettings = () =>
  within(screen.getByRole("contentinfo")).getByRole("button", { name: "Cookie-Einstellungen" });
const dialog = () => document.querySelector("dialog")!;

beforeEach(() => {
  pathname = "/";
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("first visit", () => {
  it("shows the modal with three actions and sets no consent cookie yet", () => {
    render(<Site />);
    expect(screen.getByRole("heading", { name: "Cookies & Dienste" })).toBeInTheDocument();
    expect(dialog()).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Alle akzeptieren" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Optionale ablehnen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Einstellungen" })).toBeInTheDocument();
    expect(readConsent()).toBeNull();
  });

  it("blocks optional scripts and embeds before consent", () => {
    render(<Site />);
    expect(screen.queryByTestId("analytics-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("map-embed")).not.toBeInTheDocument();
    expect(document.querySelector('script[src*="analytics.example"]')).toBeNull();
    expect(document.querySelector('iframe[src*="maps.example"]')).toBeNull();
    // The embed gets a visible placeholder instead.
    expect(screen.getByText(/Dieser Inhalt wird von Beispiel Maps geladen/)).toBeInTheDocument();
  });

  it("does not preselect optional categories", async () => {
    render(<Site />);
    await userEvent.click(screen.getByRole("button", { name: "Einstellungen" }));
    expect(screen.getByRole("switch", { name: /Notwendig/ })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Notwendig/ })).toBeDisabled();
    for (const name of [/Statistik/, /Marketing/, /Externe Inhalte/]) {
      expect(screen.getByRole("switch", { name })).not.toBeChecked();
    }
  });

  it("cannot be dismissed with Escape before a choice is made", () => {
    render(<Site />);
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(modalTitle()).toBeInTheDocument();
    expect(readConsent()).toBeNull();
  });

  it("does not cover the privacy page", () => {
    pathname = "/datenschutz";
    render(<Site />);
    expect(modalTitle()).not.toBeInTheDocument();
  });
});

describe("accepting", () => {
  it("stores all categories, loads optional content and stays closed on the next visit", async () => {
    const { unmount } = render(<Site />);
    await userEvent.click(screen.getByRole("button", { name: "Alle akzeptieren" }));

    expect(readConsent()).toMatchObject({ analytics: true, marketing: true, media: true });
    expect(modalTitle()).not.toBeInTheDocument();
    expect(dialog()).not.toHaveAttribute("open");
    expect(screen.getByTestId("analytics-script")).toBeInTheDocument();
    expect(screen.getByTestId("map-embed")).toBeInTheDocument();

    unmount();
    render(<Site />);
    expect(modalTitle()).not.toBeInTheDocument();
  });
});

describe("rejecting", () => {
  it("stores no optional categories, keeps them blocked and leaves the site usable", async () => {
    const { unmount } = render(<Site />);
    await userEvent.click(screen.getByRole("button", { name: "Optionale ablehnen" }));

    expect(readConsent()).toMatchObject({ analytics: false, marketing: false, media: false });
    expect(modalTitle()).not.toBeInTheDocument();
    expect(screen.queryByTestId("analytics-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("map-embed")).not.toBeInTheDocument();
    // Reservation stays available.
    const form = screen.getByRole("form", { name: "Reservierung" });
    expect(within(form).getByRole("button", { name: "Anfrage senden" })).toBeEnabled();

    unmount();
    render(<Site />);
    expect(modalTitle()).not.toBeInTheDocument();
  });
});

describe("customizing", () => {
  it("saves exactly the categories that were switched on", async () => {
    render(<Site />);
    await userEvent.click(screen.getByRole("button", { name: "Einstellungen" }));
    await userEvent.click(screen.getByRole("switch", { name: /Statistik/ }));
    await userEvent.click(screen.getByRole("button", { name: "Auswahl speichern" }));

    expect(readConsent()).toMatchObject({ analytics: true, marketing: false, media: false });
    expect(screen.getByTestId("analytics-script")).toBeInTheDocument();
    expect(screen.queryByTestId("map-embed")).not.toBeInTheDocument();
  });
});

describe("changing preferences later", () => {
  it("reopens from the footer with the saved choice and can withdraw it", async () => {
    setCookie(ALL);
    const reload = vi.spyOn(browser, "reload").mockImplementation(() => {});
    render(<Site />);
    expect(modalTitle()).not.toBeInTheDocument();
    expect(screen.getByTestId("analytics-script")).toBeInTheDocument();

    await userEvent.click(footerSettings());
    expect(screen.getByRole("heading", { name: "Cookie-Einstellungen" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Statistik/ })).toBeChecked();

    await userEvent.click(screen.getByRole("switch", { name: /Statistik/ }));
    await userEvent.click(screen.getByRole("button", { name: "Auswahl speichern" }));

    expect(readConsent()).toMatchObject({ analytics: false, marketing: true, media: true });
    expect(screen.queryByTestId("analytics-script")).not.toBeInTheDocument();
    // Scripts that already ran can only be removed by reloading.
    expect(reload).toHaveBeenCalledOnce();
  });

  it("can be closed with Escape once a choice exists", async () => {
    setCookie({ analytics: false, marketing: false, media: false });
    render(<Site />);
    await userEvent.click(footerSettings());
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(modalTitle()).not.toBeInTheDocument();
  });

  it("does not reload when only granting more", async () => {
    setCookie({ analytics: false, marketing: false, media: false });
    const reload = vi.spyOn(browser, "reload").mockImplementation(() => {});
    render(<Site />);
    await userEvent.click(footerSettings());
    await userEvent.click(screen.getByRole("button", { name: "Alle akzeptieren" }));
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("stored consent", () => {
  it("asks again when the saved consent is from an older version", () => {
    setCookie(ALL, CONSENT_VERSION - 1);
    render(<Site />);
    expect(screen.getByRole("heading", { name: "Cookies & Dienste" })).toBeInTheDocument();
    expect(screen.queryByTestId("analytics-script")).not.toBeInTheDocument();
  });

  it("ignores malformed cookie values", () => {
    expect(parseConsent("not-json")).toBeNull();
    expect(parseConsent(encodeURIComponent(JSON.stringify({ analytics: true })))).toBeNull();
  });
});
