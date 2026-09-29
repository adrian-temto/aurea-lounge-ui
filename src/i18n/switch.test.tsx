import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOCALE_COOKIE, LOCALE_SWITCH_KEY, type Locale } from "./config";

beforeEach(() => {
  sessionStorage.clear();
  // Skip the fade so the switch happens synchronously.
  window.matchMedia = ((q: string) => ({
    matches: q.includes("reduce"),
  })) as typeof window.matchMedia;
  vi.resetModules();
});

async function mount(locale: Locale, restore = vi.fn()) {
  // Fresh modules per "page load", like a real navigation (the switcher shares switch.ts).
  const { useCarryOver } = await import("./switch");
  const { LanguageSwitcher } = await import("@/components/LanguageSwitcher");
  const { I18nProvider } = await import("./client");
  function Reservation() {
    useCarryOver(
      "reservation",
      () => ({ date: "2099-05-02", time: "20:30", guests: "4" }),
      restore,
    );
    return null;
  }
  render(
    <I18nProvider locale={locale}>
      <Reservation />
      <LanguageSwitcher />
    </I18nProvider>,
  );
  return restore;
}

describe("language switcher", () => {
  it("shows DE | EN with the current language marked and not clickable", async () => {
    await mount("en");
    const en = screen.getByRole("button", { name: "English" });
    const de = screen.getByRole("button", { name: "Deutsch" });
    expect(en).toHaveAttribute("aria-current", "true");
    expect(en).toBeDisabled();
    expect(de).toBeEnabled();
    expect(de).toHaveAttribute("lang", "de");
    expect(screen.getByRole("group", { name: "Language" })).toHaveTextContent("de|en");
  });

  it("remembers the choice and hands the reservation selections to the next page", async () => {
    await mount("de");
    await userEvent.click(screen.getByRole("button", { name: "English" }));

    expect(document.cookie).toContain(`${LOCALE_COOKIE}=en`);
    const carried = JSON.parse(sessionStorage.getItem(LOCALE_SWITCH_KEY) ?? "{}");
    expect(carried).toMatchObject({
      reservation: { date: "2099-05-02", time: "20:30", guests: "4" },
      scrollY: expect.any(Number),
    });
    // Nothing personal travels along.
    expect(JSON.stringify(carried)).not.toMatch(/name|phone/i);
  });

  it("restores the selections once on the new page, then forgets them", async () => {
    sessionStorage.setItem(
      LOCALE_SWITCH_KEY,
      JSON.stringify({
        reservation: { date: "2099-05-02", time: "20:30", guests: "4" },
        scrollY: 0,
      }),
    );
    const restore = await mount("en");
    expect(restore).toHaveBeenCalledOnce();
    expect(restore).toHaveBeenCalledWith({ date: "2099-05-02", time: "20:30", guests: "4" });
    expect(sessionStorage.getItem(LOCALE_SWITCH_KEY)).toBeNull();
  });

  it("restores nothing on an ordinary visit", async () => {
    const restore = await mount("de");
    expect(restore).not.toHaveBeenCalled();
  });
});
