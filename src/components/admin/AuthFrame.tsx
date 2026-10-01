import type { ReactNode } from "react";

import lounge from "@/assets/lounge.jpg";

export const authInputCls =
  "mt-3 w-full border-0 border-b border-border bg-transparent pb-3 text-base outline-none transition-colors duration-500 placeholder:text-muted-foreground/50 focus:border-gold";

export const authButtonCls =
  "min-h-11 w-full bg-foreground py-5 text-[0.72rem] uppercase tracking-[0.28em] text-background transition-colors duration-500 hover:bg-gold hover:text-foreground disabled:opacity-60";

/** Login, admission link and first password: photo on the left from md up, the form on the right. */
export function AuthFrame({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-[100svh] bg-background md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-espresso md:block">
        <img
          src={lounge.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-cream">
          <p className="eyebrow text-gold">Auréa Admin</p>
          <p className="mt-6 max-w-md font-serif text-5xl font-light leading-[1.05]">
            Reservierungen &amp;
            <br />
            <em>Speisekarte</em>
          </p>
        </div>
      </div>

      <div className="flex flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 md:px-16 md:py-12">
        <img
          src="/logo.svg"
          alt="Auréa"
          width={645}
          height={167}
          className="h-10 w-auto self-start"
        />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl font-light leading-none md:text-6xl">{title}</h1>
          <div className="my-8 h-px w-16 bg-gold" aria-hidden />
          {children}
        </div>
      </div>
    </main>
  );
}
