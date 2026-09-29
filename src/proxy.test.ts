// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocalizedRoute,
  localizePath,
  splitLocale,
} from "@/i18n/config";

let signedIn = false;
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getClaims: async () => ({ data: signedIn ? { claims: { sub: "u1" } } : null }) },
  }),
}));

const { proxy } = await import("./proxy");

const request = (
  path: string,
  init: { cookie?: string; headers?: Record<string, string>; method?: string } = {},
) =>
  new NextRequest(new URL(path, "https://aurealounge.de"), {
    method: init.method ?? "GET",
    headers: { ...(init.cookie ? { cookie: init.cookie } : {}), ...init.headers },
  });

/** What the page will read from headers() after the proxy ran. */
const localeSeen = (res: Response) => res.headers.get(`x-middleware-request-${LOCALE_HEADER}`);
const rewrittenTo = (res: Response) => {
  const url = res.headers.get("x-middleware-rewrite");
  return url ? new URL(url).pathname : null;
};
const redirectedTo = (res: Response) => {
  const url = res.headers.get("location");
  return url ? `${new URL(url).pathname}${new URL(url).search}` : null;
};

beforeEach(() => {
  signedIn = false;
});

describe("paths", () => {
  it("adds and removes the /en prefix, keeping query and hash", () => {
    expect(localizePath("en", "/")).toBe("/en");
    expect(localizePath("en", "/join?mode=login")).toBe("/en/join?mode=login");
    expect(localizePath("en", "/#reserve")).toBe("/en#reserve");
    expect(localizePath("de", "/join")).toBe("/join");
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/en/account")).toEqual({ locale: "en", path: "/account" });
    expect(splitLocale("/english-menu")).toEqual({ locale: "de", path: "/english-menu" });
  });

  it("knows which pages exist in English", () => {
    expect(["/", "/join", "/account"].every(isLocalizedRoute)).toBe(true);
    expect(["/datenschutz", "/admin", "/admin/menu"].some(isLocalizedRoute)).toBe(false);
  });
});

describe("proxy", () => {
  it("serves German at the plain URL, so /#menu and printed QR codes keep working", async () => {
    const res = await proxy(request("/"));
    expect(redirectedTo(res)).toBeNull();
    expect(rewrittenTo(res)).toBeNull();
    expect(localeSeen(res)).toBe("de");
  });

  it("serves the same page in English under /en", async () => {
    const res = await proxy(request("/en"));
    expect(rewrittenTo(res)).toBe("/");
    expect(localeSeen(res)).toBe("en");
  });

  it("ignores a language header sent by the browser", async () => {
    const res = await proxy(request("/", { headers: { [LOCALE_HEADER]: "en" } }));
    expect(localeSeen(res)).toBe("de");
  });

  it("brings back English for visitors who chose it", async () => {
    const res = await proxy(request("/join?mode=login", { cookie: `${LOCALE_COOKIE}=en` }));
    expect(redirectedTo(res)).toBe("/en/join?mode=login");
  });

  it("keeps German for visitors who chose German, or chose nothing", async () => {
    expect(redirectedTo(await proxy(request("/", { cookie: `${LOCALE_COOKIE}=de` })))).toBeNull();
    expect(redirectedTo(await proxy(request("/")))).toBeNull();
  });

  it("never redirects form posts (server actions)", async () => {
    const res = await proxy(request("/", { cookie: `${LOCALE_COOKIE}=en`, method: "POST" }));
    expect(redirectedTo(res)).toBeNull();
  });

  it("sends English links to German-only pages to the German page", async () => {
    expect(redirectedTo(await proxy(request("/en/datenschutz")))).toBe("/datenschutz");
    expect(redirectedTo(await proxy(request("/en/admin/menu")))).toBe("/admin/menu");
  });

  it("does not bounce English visitors off German-only pages", async () => {
    const res = await proxy(request("/datenschutz", { cookie: `${LOCALE_COOKIE}=en` }));
    expect(redirectedTo(res)).toBeNull();
  });

  it("asks signed-out visitors to log in, in their language", async () => {
    expect(redirectedTo(await proxy(request("/en/account")))).toBe(
      `/en/join?mode=login&next=${encodeURIComponent("/en/account")}`,
    );
    expect(redirectedTo(await proxy(request("/account")))).toBe(
      `/join?mode=login&next=${encodeURIComponent("/account")}`,
    );
  });

  it("lets signed-in guests through to the English account page", async () => {
    signedIn = true;
    const res = await proxy(request("/en/account"));
    expect(rewrittenTo(res)).toBe("/account");
    expect(localeSeen(res)).toBe("en");
  });
});
