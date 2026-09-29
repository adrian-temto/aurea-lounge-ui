"use client";

import { useEffect, useRef } from "react";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_SWITCH_KEY,
  localizePath,
  splitLocale,
  type Locale,
} from "./config";

/**
 * Switching language loads the same page in the other language. Before leaving, components
 * that registered with useCarryOver hand over their non-personal selections (e.g. the
 * reservation date or the open menu tab); the new page restores them along with the scroll
 * position. Stored in sessionStorage and removed as soon as it has been read.
 */
const STORAGE_KEY = LOCALE_SWITCH_KEY;
const savers = new Map<string, () => unknown>();
let pending: Record<string, unknown> | null | undefined;

function readPending() {
  if (pending !== undefined) return pending;
  pending = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (raw) pending = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Storage blocked or malformed: nothing to restore.
  }
  return pending;
}

/** Registers `save` for the next switch and calls `restore` once after arriving from one. */
export function useCarryOver<T>(key: string, save: () => T, restore: (value: T) => void) {
  const latest = useRef({ save, restore });
  latest.current = { save, restore };
  useEffect(() => {
    savers.set(key, () => latest.current.save());
    const data = readPending();
    if (data && key in data) {
      latest.current.restore(data[key] as T);
      delete data[key];
    }
    return () => {
      savers.delete(key);
    };
  }, [key]);
}

/** Restores the scroll position after a switch; call once near the top of the page. */
export function useRestoreScroll() {
  useEffect(() => {
    const data = readPending();
    const y = data?.["scrollY"];
    // After carry-over restores have re-rendered the page.
    if (typeof y === "number") requestAnimationFrame(() => window.scrollTo(0, y));
  }, []);
}

export function switchLocale(target: Locale) {
  const data: Record<string, unknown> = { scrollY: window.scrollY };
  savers.forEach((save, key) => {
    try {
      data[key] = save();
    } catch {
      // A broken saver must not block the switch.
    }
  });
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Without storage the switch still works, just without carrying selections over.
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${target}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;

  const { path } = splitLocale(window.location.pathname);
  // Keep ?next=… on the sign-in page, but not the one-off notices that only make sense once.
  const params = new URLSearchParams(window.location.search);
  params.delete("notice");
  const query = params.toString();
  const url = localizePath(target, `${path}${query ? `?${query}` : ""}`);

  // Fade the page out briefly so the switch reads as one calm change, not a hard reload.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.location.assign(url);
    return;
  }
  const root = document.documentElement;
  root.classList.add("locale-leaving");
  // Coming back via the back button restores this page from cache: show it again.
  window.addEventListener(
    "pageshow",
    (e) => {
      if (e.persisted) root.classList.remove("locale-leaving");
    },
    { once: true },
  );
  window.setTimeout(() => window.location.assign(url), 180);
}

/**
 * Pairs with the inline script in app/layout.tsx, which hides the page while a switched-to page
 * restores its scroll position. Fades it back in once that has happened. Call once, high up.
 */
export function useLocaleArrival() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("locale-arriving")) return;
    // Two frames: after useRestoreScroll (a child effect) has scrolled into place.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        root.classList.add("locale-arrived");
        root.classList.remove("locale-arriving");
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);
}
