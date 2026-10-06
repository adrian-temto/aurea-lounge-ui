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
  init: { cookie?: string; headers?: Record<string, string>; method?: string; host?: string } = {},
) => {
  const host = init.host ?? "aurealounge.de";
  return new NextRequest(new URL(path, `https://${host}`), {
    method: init.method ?? "GET",
    headers: { host, ...(init.cookie ? { cookie: init.cookie } : {}), ...init.headers },
  });
};

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
    expect(localizePath("en", "/karte?tab=1")).toBe("/en/karte?tab=1");
    expect(localizePath("en", "/#reserve")).toBe("/en#reserve");
    expect(localizePath("de", "/karte")).toBe("/karte");
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/en/karte")).toEqual({ locale: "en", path: "/karte" });
    expect(splitLocale("/english-menu")).toEqual({ locale: "de", path: "/english-menu" });
  });

  it("knows which pages exist in English", () => {
    expect(
      ["/", "/karte", "/anfahrt", "/datenschutz", "/impressum", "/angebote/bestaetigen"].every(
        isLocalizedRoute,
      ),
    ).toBe(true);
    expect(["/admin", "/login", "/account"].some(isLocalizedRoute)).toBe(false);
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
    const res = await proxy(request("/karte?tab=1", { cookie: `${LOCALE_COOKIE}=en` }));
    expect(redirectedTo(res)).toBe("/en/karte?tab=1");
  });

  it("keeps German for visitors who chose German, or chose nothing", async () => {
    expect(redirectedTo(await proxy(request("/", { cookie: `${LOCALE_COOKIE}=de` })))).toBeNull();
    expect(redirectedTo(await proxy(request("/")))).toBeNull();
  });

  it("never redirects form posts (server actions)", async () => {
    const res = await proxy(request("/", { cookie: `${LOCALE_COOKIE}=en`, method: "POST" }));
    expect(redirectedTo(res)).toBeNull();
  });

  it("serves the legal pages in English too", async () => {
    for (const path of ["/datenschutz", "/impressum"]) {
      const res = await proxy(request(`/en${path}`));
      expect(redirectedTo(res)).toBeNull();
      expect(rewrittenTo(res)).toBe(path);
      expect(localeSeen(res)).toBe("en");
    }
  });

  it("sends English links to German-only pages to the German page", async () => {
    expect(redirectedTo(await proxy(request("/en/unbekannt")))).toBe("/unbekannt");
  });

  it("sends English links to the team area to the German page", async () => {
    expect(redirectedTo(await proxy(request("/en/admin")))).toBe("/admin");
    expect(redirectedTo(await proxy(request("/en/login")))).toBe("/login");
  });
});

describe("team area", () => {
  it("asks signed-out visitors to log in", async () => {
    expect(redirectedTo(await proxy(request("/admin/menu")))).toBe(
      `/login?next=${encodeURIComponent("/admin/menu")}`,
    );
    const login = await proxy(request("/login"));
    expect(redirectedTo(login)).toBeNull();
    expect(localeSeen(login)).toBe("de");
  });

  it("lets signed-in team members through", async () => {
    signedIn = true;
    const res = await proxy(request("/admin"));
    expect(redirectedTo(res)).toBeNull();
    expect(rewrittenTo(res)).toBeNull();
  });
});
