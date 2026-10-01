"use client";

import { useActionState } from "react";
import Link from "next/link";

import { confirmMarketing } from "@/app/actions/marketing";
import { useI18n } from "@/i18n/client";

import { legalButton } from "./LegalPage";

/** The confirm button of the double opt-in page, then the outcome. */
export function ConfirmOffers({ token }: { token: string }) {
  const { t, href } = useI18n();
  const o = t.offers;
  const [state, action, pending] = useActionState(confirmMarketing, token ? null : "invalid");

  if (state) {
    const done = state === "done";
    return (
      <div role="status" className="mt-10">
        <h2 className="font-serif text-3xl font-light">{done ? o.doneTitle : o.invalidTitle}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          {done ? o.doneText : o.invalidText}
        </p>
        <Link href={href("/")} className={`mt-8 ${legalButton}`}>
          {o.home}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-10">
      <input type="hidden" name="token" value={token} />
      <p className="max-w-xl leading-relaxed text-muted-foreground">{o.text}</p>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{o.withdraw}</p>
      <button
        disabled={pending}
        className="mt-8 min-h-11 w-full bg-foreground px-8 py-4 text-[0.72rem] uppercase tracking-[0.25em] text-background transition-colors duration-500 hover:bg-gold hover:text-foreground disabled:opacity-60 sm:w-auto"
      >
        {pending ? o.sending : o.button}
      </button>
    </form>
  );
}
