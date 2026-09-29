"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

import {
  ALL,
  NONE,
  OPTIONAL_CATEGORIES,
  allows,
  browser,
  readConsent,
  writeConsent,
  type Category,
  type Choices,
  type Consent,
} from "@/lib/consent";

import { ConsentDialog, type View } from "./ConsentDialog";

type Ctx = {
  /** null until the visitor has chosen (or before the cookie was read). */
  consent: Consent | null;
  /** True once the cookie has been read on the client. */
  ready: boolean;
  /** True while the consent dialog is on screen; other popups should wait for it. */
  dialogOpen: boolean;
  allows: (category: Category) => boolean;
  openSettings: () => void;
  save: (choices: Choices) => void;
};

export const PRIVACY_PATH = "/datenschutz";

const ConsentContext = createContext<Ctx | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside <ConsentProvider>");
  return ctx;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View | null>(null);
  // The privacy page explains the choices, so the first-visit modal must not cover it.
  const onPrivacyPage = usePathname() === PRIVACY_PATH;
  const shownView = onPrivacyPage && !consent && view === "summary" ? null : view;

  // The cookie is only readable in the browser; first visits get the modal.
  useEffect(() => {
    const saved = readConsent();
    setConsent(saved);
    setReady(true);
    if (!saved) setView("summary");
  }, []);

  const save = useCallback(
    (choices: Choices) => {
      const next = writeConsent(choices);
      // A script that already ran can't be unloaded, so withdrawing consent reloads the page.
      const withdrawn = OPTIONAL_CATEGORIES.some((c) => consent?.[c] && !next[c]);
      setConsent(next);
      setView(null);
      if (withdrawn) browser.reload();
    },
    [consent],
  );

  const value = useMemo<Ctx>(
    () => ({
      consent,
      ready,
      dialogOpen: shownView !== null,
      allows: (category) => allows(consent, category),
      openSettings: () => setView("customize"),
      save,
    }),
    [consent, ready, shownView, save],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <ConsentDialog
        view={shownView}
        current={consent ?? NONE}
        dismissible={consent !== null}
        onView={setView}
        onClose={() => setView(null)}
        onAcceptAll={() => save(ALL)}
        onRejectOptional={() => save(NONE)}
        onSave={save}
      />
    </ConsentContext.Provider>
  );
}
