"use client";

import { useActionState, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { createReservation } from "@/app/actions/reservations";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/client";
import { useCarryOver, useRestoreScroll } from "@/i18n/switch";
import { CONTACT, MAX_ONLINE_GUESTS, TIME_SLOTS } from "@/lib/reservation";
import type { Localized, PublicCategory, PublicItem } from "@/lib/menu";
import type { AccountLink } from "@/lib/types";
import {
  GroupHint,
  ReservationModalProvider,
  ReservationPrivacyNote,
  ReserveLink,
} from "./ReservationModal";
import hero from "@/assets/hero.jpg";
import breakfast from "@/assets/breakfast.jpg";
import cafe from "@/assets/cafe.jpg";
import lounge from "@/assets/lounge.jpg";
import story from "@/assets/story.jpg";
import atmos from "@/assets/atmos.jpg";
import pastry from "@/assets/pastry.jpg";
import cocktail from "@/assets/cocktail.jpg";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Menu text in the visitor's language; German fallbacks are marked lang="de" for screen readers. */
function Text({ value }: { value: Localized }) {
  const { locale } = useI18n();
  return value.lang === locale ? <>{value.text}</> : <span lang={value.lang}>{value.text}</span>;
}

function useAccountLink(account: AccountLink) {
  const { t, href } = useI18n();
  // The dashboard is German-only, so it keeps its plain URL.
  return {
    href: account.kind === "dashboard" ? account.href : href(account.href),
    label: t.nav.account[account.kind],
  };
}

function Header({ account }: { account: AccountLink }) {
  const { t } = useI18n();
  const accountLink = useAccountLink(account);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 60);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  // Escape closes the mobile menu and hands focus back to its button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const solid = scrolled || open;
  return (
    <>
      <header
        // right-scroll-bar-position: keeps the header still when a dialog locks page scroll.
        className={`right-scroll-bar-position fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color,padding] duration-500 ease-aurea ${
          scrolled ? "bg-background/95 py-4 text-foreground backdrop-blur-md border-b border-border" : "py-7 text-cream"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12">
          <a href="#top" aria-label={t.nav.home} className="block shrink-0">
            {/* The logo's tagline is dark brown, so swap to the cream variant over the dark hero. */}
            <img
              src={solid ? "/logo.svg" : "/logo-light.svg"}
              alt={t.nav.logoAlt}
              width={645}
              height={167}
              className={`w-auto transition-[height] duration-500 ease-aurea ${scrolled ? "h-9 md:h-10" : "h-10 md:h-12"}`}
            />
          </a>
          <nav className="hidden items-center gap-6 lg:flex xl:gap-9">
            {t.nav.items.map(([l, h]) => (
              <a key={l} href={h} className="link-line whitespace-nowrap text-[0.72rem] uppercase tracking-[0.18em] xl:tracking-[0.22em]">
                {l}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            <LanguageSwitcher className="text-[0.72rem]" />
            <Link href={accountLink.href} className="link-line whitespace-nowrap text-[0.72rem] uppercase tracking-[0.18em] xl:tracking-[0.22em]">
              {accountLink.label}
            </Link>
            <ReserveLink
              className={`press whitespace-nowrap border px-4 py-3 text-[0.7rem] uppercase tracking-[0.2em] xl:px-6 xl:tracking-[0.25em] ${
                scrolled ? "border-foreground hover:bg-foreground hover:text-background" : "border-cream/60 hover:bg-cream hover:text-espresso"
              }`}
            >
              {t.nav.reserve}
            </ReserveLink>
          </div>
          <div className={`relative z-50 flex items-center gap-3 lg:hidden ${solid ? "text-foreground" : ""}`}>
            <LanguageSwitcher className="text-[0.72rem]" />
            <button
              ref={menuButton}
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[7px]"
            >
              <span className={`h-px w-7 bg-current transition-transform duration-300 ease-aurea ${open ? "translate-y-[4px] rotate-45" : ""}`} />
              <span className={`h-px w-7 bg-current transition-transform duration-300 ease-aurea ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>
      <div
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-background px-8 pb-10 pt-32 transition-opacity lg:hidden ${
          open ? "opacity-100 duration-[400ms] ease-aurea" : "pointer-events-none opacity-0 duration-200 ease-aurea-in"
        }`}
      >
        <nav className="flex flex-col gap-4">
          {t.nav.items.map(([l, h], i) => (
            <a
              key={l}
              href={h}
              onClick={() => setOpen(false)}
              className={`w-fit font-serif text-5xl font-light transition-[opacity,transform,color] ease-aurea hover:text-gold focus-visible:text-gold focus-visible:outline-none ${
                open ? "translate-y-0 opacity-100 duration-500" : "translate-y-3 opacity-0 duration-150"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 45}ms` : "0ms" }}
            >
              {l}
            </a>
          ))}
        </nav>
        <div>
          <div className="mb-6 h-px w-16 bg-gold" />
          <ReserveLink returnFocus={menuButton} onClick={() => setOpen(false)} className="press block bg-foreground py-4 text-center text-xs uppercase tracking-[0.25em] text-background hover:bg-gold hover:text-foreground">
            {t.nav.reserve}
          </ReserveLink>
          <Link href={accountLink.href} onClick={() => setOpen(false)} className="mt-3 block border border-foreground py-4 text-center text-xs uppercase tracking-[0.25em]">
            {accountLink.label}
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">{t.nav.address}</p>
        </div>
      </div>
    </>
  );
}

/** Stagger offset for the hero's entrance (see .hero-rise in globals.css). */
const rise = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function Hero() {
  const { t } = useI18n();
  return (
    <section id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-espresso text-cream">
      <img src={hero.src} alt={t.hero.imageAlt} width={1920} height={1088} fetchPriority="high" className="hero-settle absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-espresso/20" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16 md:px-12 md:pb-24">
        <p className="hero-rise eyebrow mb-8 text-gold" style={rise(80)}>{t.hero.eyebrow}</p>
        <h1 className="max-w-4xl font-serif text-[3.2rem] font-light leading-[0.98] md:text-[6.5rem]">
          <span className="hero-rise block" style={rise(180)}>{t.hero.title}</span>
          <em className="hero-rise block font-light" style={rise(300)}>{t.hero.titleEm}</em>
        </h1>
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <p className="hero-rise max-w-md text-[0.95rem] leading-relaxed text-cream/80" style={rise(440)}>{t.hero.text}</p>
          <div className="hero-rise flex flex-col gap-3 sm:flex-row" style={rise(540)}>
            <ReserveLink className="press bg-cream px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] text-espresso hover:bg-gold">
              {t.hero.reserve}
            </ReserveLink>
            <a href="#menu" className="press border border-cream/50 px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] hover:border-gold hover:text-gold">
              {t.hero.menu}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <p className="eyebrow text-muted-foreground">{t.intro.eyebrow}</p>
          <div className="gild-line mt-6 h-px w-24 bg-gold" />
        </Reveal>
        <Reveal className="md:col-span-8" delay={150}>
          <h2 className="font-serif text-6xl font-light leading-none md:text-8xl">
            {t.intro.title} <em>{t.intro.titleEm}</em>
          </h2>
          <p className="mt-10 max-w-xl font-serif text-2xl font-light leading-snug text-muted-foreground md:text-3xl">{t.intro.text}</p>
          <div className="mt-14 flex items-center gap-6 text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
            <span>07:00</span>
            <span className="gild-line h-px flex-1 bg-gradient-to-r from-gold/20 via-gold to-espresso" />
            <span>01:00</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const CHAPTER_IMAGES = [
  { n: "I", img: breakfast },
  { n: "II", img: cafe },
  { n: "III", img: lounge },
];

function Chapters() {
  const { t } = useI18n();
  return (
    <section id="tag" className="relative">
      <div className="mx-auto max-w-[1440px] px-6 pb-28 md:px-12 md:pb-40">
        <div className="grid gap-16 md:grid-cols-3 md:gap-8">
          {t.chapters.map((c, i) => {
            const pic = CHAPTER_IMAGES[i]!;
            return (
              <Reveal key={pic.n} delay={i * 120} className={i === 1 ? "md:mt-32" : i === 2 ? "md:mt-64" : ""}>
                <article className="group">
                  <div className={`relative overflow-hidden ${i === 2 ? "bg-espresso" : "bg-muted"}`}>
                    <img src={pic.img.src} alt={c.alt} loading="lazy" width={896} height={1152} className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]" />
                    <span className="absolute left-5 top-5 font-serif text-lg italic text-cream">{pic.n}</span>
                  </div>
                  <div className="mt-7 flex items-baseline justify-between border-b border-border pb-4">
                    <h3 className="font-serif text-4xl font-light md:text-5xl">{c.title}</h3>
                    <span className="eyebrow text-gold">{c.time}</span>
                  </div>
                  <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">{c.copy}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Story() {
  const { t } = useI18n();
  return (
    <section id="story" className="bg-card">
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
        <div className="relative min-h-[70vh] overflow-hidden">
          <img src={story.src} alt={t.story.imageAlt} loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex items-center px-6 py-24 md:px-20 md:py-36">
          <Reveal>
            <p className="eyebrow text-muted-foreground">{t.story.eyebrow}</p>
            <h2 className="mt-8 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
              {t.story.title}
              <br />
              <em>{t.story.titleEm}</em>
            </h2>
            <div className="my-10 flex items-center gap-3" aria-hidden>
              <span className="gild-line h-px w-12 bg-gold" />
              <span className="gild-dot h-1.5 w-1.5 rotate-45 bg-gold" />
            </div>
            <p className="max-w-lg leading-relaxed text-muted-foreground">{t.story.p1}</p>
            <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">{t.story.p2}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Menu({ menu }: { menu: PublicCategory[] }) {
  const { t } = useI18n();
  const [catId, setCatId] = useState(menu[0]?.id ?? 0);
  // The open tab survives a language switch.
  useCarryOver(
    "menuTab",
    () => catId,
    (id) => {
      if (typeof id === "number" && menu.some((c) => c.id === id)) setCatId(id);
    },
  );
  const cat = menu.find((c) => c.id === catId) ?? menu[0];
  // Only animate dishes after a visitor changes the tab, not on first load.
  const [changed, setChanged] = useState(false);
  return (
    <section id="menu" className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
      <Reveal className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow text-muted-foreground">{t.menu.eyebrow}</p>
          <h2 className="mt-4 font-serif text-7xl font-light italic leading-none md:text-9xl">{t.menu.title}</h2>
        </div>
        <p className="max-w-sm text-muted-foreground md:col-span-5 md:justify-self-end">{t.menu.subtitle}</p>
      </Reveal>
      <div className="no-scrollbar -mx-6 mt-16 flex gap-8 overflow-x-auto border-b border-border px-6 md:mx-0 md:px-0">
        {menu.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCatId(c.id);
              setChanged(true);
            }}
            aria-pressed={cat?.id === c.id}
            className={`group relative shrink-0 pb-5 text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-300 focus-visible:text-foreground focus-visible:outline-none ${
              cat?.id === c.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Text value={c.name} />
            <span
              aria-hidden
              // bottom-0, not -bottom-px: the scrolling tab bar would clip a line below the button.
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-500 ease-aurea ${
                cat?.id === c.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-[0.35] group-focus-visible:scale-x-[0.35]"
              }`}
            />
          </button>
        ))}
      </div>
      <div key={cat?.id} className={changed ? "animate-in fade-in duration-300" : undefined}>
        {!cat && <p className="py-16 font-serif text-2xl italic text-muted-foreground">{t.menu.empty}</p>}
        {cat && cat.items.length > 0 && <DishGrid items={cat.items} animate={changed} />}
        {cat?.sections.map((s) => (
          <div key={s.id} className="mt-16 first:mt-10">
            <h3 className="flex items-center gap-4 font-serif text-3xl font-light italic md:text-4xl">
              <Text value={s.name} />
              <span className="h-px w-12 bg-gold" aria-hidden />
            </h3>
            <DishGrid items={s.items} animate={changed} />
          </div>
        ))}
      </div>
      <div className="mt-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">{t.menu.legend}</p>
        <a href="#menu" className="group inline-flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.25em]">
          <span className="link-line">{t.menu.fullMenu}</span>
          <span className="h-px w-10 origin-left bg-gold transition-transform duration-500 ease-aurea group-hover:scale-x-150 group-focus-visible:scale-x-150" />
        </a>
      </div>
    </section>
  );
}

function DishGrid({ items, animate = false }: { items: PublicItem[]; animate?: boolean }) {
  const { t } = useI18n();
  return (
    <ul className="grid md:grid-cols-2 md:gap-x-20">
      {items.map((it, i) => (
        <li
          key={it.id}
          className={`group flex gap-4 border-b border-border py-8 ${animate ? "dish-in" : ""}`}
          style={animate ? ({ "--i": i } as CSSProperties) : undefined}
        >
          {it.image && (
            <span className="size-16 shrink-0 overflow-hidden md:size-20">
              <img src={it.image} alt="" loading="lazy" className={`size-full object-cover transition-transform duration-700 ease-aurea group-hover:scale-105 ${it.available ? "" : "opacity-50 grayscale"}`} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-4">
              <h4 className={`font-serif text-2xl transition-colors duration-300 group-hover:text-gold md:text-[1.7rem] ${it.available ? "" : "text-muted-foreground"}`}>
                <Text value={it.name} />
              </h4>
              {it.tag && (
                <span className="border border-olive/40 px-1.5 py-0.5 text-[0.6rem] tracking-widest text-olive" title={t.menu.tags[it.tag]}>
                  {it.tag}
                </span>
              )}
              <span className="flex-1 translate-y-[-4px] border-b border-dotted border-border transition-colors duration-300 group-hover:border-gold/50" />
              <span className={`whitespace-nowrap text-sm tabular-nums ${it.available ? "" : "text-muted-foreground line-through"}`}>€{it.price}</span>
            </div>
            {!it.available && <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-gold">{t.menu.unavailable}</p>}
            {it.desc.text && (
              <p className="mt-2 text-sm text-muted-foreground">
                <Text value={it.desc} />
              </p>
            )}
            {it.allergens.length > 0 && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <span className="text-foreground/70">{t.menu.allergens}:</span> {it.allergens.join(" · ")}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

const GALLERY = [
  { src: pastry, cls: "md:col-span-4 aspect-square" },
  { src: cafe, cls: "md:col-span-3 md:mt-24 aspect-[4/5]" },
  { src: cocktail, cls: "col-span-2 md:col-span-5 aspect-[4/5] md:-mt-32" },
];

function Atmosphere() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  // Moves the photo directly (no React re-render per scroll event), at most once per frame.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = ref.current?.getBoundingClientRect();
      if (!r || !img.current || r.bottom < 0 || r.top > window.innerHeight) return;
      const y = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
      img.current.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section className="bg-espresso py-28 text-cream md:py-40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal className="mb-16 grid gap-6 md:grid-cols-12">
          <p className="eyebrow text-gold md:col-span-4">{t.atmosphere.eyebrow}</p>
          <h2 className="font-serif text-5xl font-light leading-[1.02] md:col-span-8 md:text-8xl">
            {t.atmosphere.title}
            <br />
            <em className="text-gold">{t.atmosphere.titleEm}</em>
          </h2>
        </Reveal>
        <div ref={ref} className="relative h-[60vh] overflow-hidden md:h-[80vh]">
          <img src={atmos.src} alt={t.atmosphere.alts[0]} loading="lazy" width={1920} height={1088} ref={img} className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-12 md:gap-8">
          {GALLERY.map((im, i) => (
            <Reveal key={i} delay={i * 120} className={`group overflow-hidden ${im.cls}`}>
              <img src={im.src.src} alt={t.atmosphere.alts[i + 1]} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Visit() {
  const { t } = useI18n();
  return (
    <section id="visit" className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
      <div className="grid gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-muted-foreground">{t.visit.eyebrow}</p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
            {t.visit.title}
            <br />
            <em>{t.visit.titleEm}</em>
          </h2>
          <dl className="mt-14 divide-y divide-border border-y border-border">
            {t.visit.hours.map(([d, time]) => (
              <div key={d} className="flex justify-between py-5 text-sm">
                <dt className="text-muted-foreground">{d}</dt>
                <dd className="tabular-nums">{time}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="eyebrow mb-3 text-gold">{t.visit.address}</p>
              <p className="leading-relaxed">
                {CONTACT.street}
                <br />
                {CONTACT.city}, {t.visit.country}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3 text-gold">{t.visit.phone}</p>
              <a href={CONTACT.phoneHref} className="link-line">{CONTACT.phone}</a>
            </div>
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={150}>
          <div className="relative aspect-[4/5] overflow-hidden bg-card md:aspect-auto md:h-full md:min-h-[560px]">
            <svg className="absolute inset-0 h-full w-full text-foreground/15" preserveAspectRatio="none" viewBox="0 0 400 500" fill="none" stroke="currentColor">
              <path d="M-10 120 C 120 140, 200 60, 420 110" strokeWidth="6" className="text-cream" stroke="currentColor" />
              <path d="M-10 120 C 120 140, 200 60, 420 110" strokeWidth="0.6" />
              <path d="M150 -10 C 170 150, 230 300, 210 520" strokeWidth="10" className="text-background" stroke="currentColor" />
              <path d="M150 -10 C 170 150, 230 300, 210 520" strokeWidth="0.6" />
              <path d="M-10 360 L 420 300" strokeWidth="0.5" />
              <path d="M300 -10 L 330 520" strokeWidth="0.5" />
              <path d="M60 -10 L 20 520" strokeWidth="0.4" />
              <path d="M-10 440 C 100 420, 300 470, 420 430" strokeWidth="0.4" />
              <rect x="240" y="150" width="70" height="60" className="text-olive/20" fill="currentColor" stroke="none" />
            </svg>
            <div className="absolute left-[52%] top-[44%] -translate-x-1/2 -translate-y-full text-center">
              <span className="mb-2 block font-serif text-lg italic">Auréa</span>
              <span className="mx-auto block h-3 w-3 rotate-45 bg-gold ring-8 ring-gold/20" />
            </div>
            <p className="eyebrow absolute left-6 top-6 text-muted-foreground">Beelitz · 52.23° N</p>
            <a href="#visit" className="press absolute bottom-6 right-6 bg-foreground px-7 py-4 text-[0.7rem] uppercase tracking-[0.25em] text-background hover:bg-gold hover:text-foreground">
              {t.visit.directions}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-cream/50">{label}</span>
      {children}
    </label>
  );
}
const inputCls =
  "mt-3 w-full border-0 border-b border-cream/25 bg-transparent pb-3 text-base text-cream outline-none transition-colors duration-500 placeholder:text-cream/30 focus:border-gold [color-scheme:dark]";

type Selection = { date: string; time: string; guests: string };

function Reservation() {
  const { locale, t } = useI18n();
  const [state, formAction, pending] = useActionState(createReservation, null);
  const form = useRef<HTMLFormElement>(null);
  // Date, time and guest count survive a language switch; name and phone are not stored.
  useCarryOver<Selection | null>(
    "reservation",
    () => {
      const f = form.current;
      if (!f) return null;
      const data = new FormData(f);
      return { date: String(data.get("date") ?? ""), time: String(data.get("time") ?? ""), guests: String(data.get("guests") ?? "") };
    },
    (s) => {
      const f = form.current;
      if (!f || !s) return;
      const el = f.elements;
      (el.namedItem("date") as HTMLInputElement).value = s.date;
      if (TIME_SLOTS.includes(s.time)) (el.namedItem("time") as HTMLSelectElement).value = s.time;
      const guest = f.querySelector<HTMLInputElement>(`input[name="guests"][value="${CSS.escape(s.guests)}"]`);
      if (guest) guest.checked = true;
    },
  );
  return (
    <section id="reserve" className="bg-espresso text-cream">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-6 py-28 md:grid-cols-12 md:px-12 md:py-40">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-gold">{t.reservation.eyebrow}</p>
          <h2 className="mt-6 font-serif text-6xl font-light leading-none md:text-8xl">
            {t.reservation.title} <em>{t.reservation.titleEm}</em>
          </h2>
          <p className="mt-8 max-w-sm leading-relaxed text-cream/70">{t.reservation.intro}</p>
          <div className="mt-12 flex items-center gap-3" aria-hidden>
            <span className="gild-line h-px w-12 bg-gold" />
            <span className="gild-dot h-1.5 w-1.5 rotate-45 bg-gold" />
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={150}>
          <form ref={form} action={formAction} className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <Field label={t.reservation.name}>
              <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputCls} placeholder={t.reservation.namePlaceholder} />
            </Field>
            <Field label={t.reservation.phone}>
              <input name="phone" type="tel" required minLength={5} maxLength={30} autoComplete="tel" className={inputCls} placeholder="+49" />
            </Field>
            <Field label={t.reservation.date}>
              <input name="date" type="date" required className={inputCls} />
            </Field>
            <Field label={t.reservation.time}>
              <select name="time" className={inputCls} defaultValue="19:00">
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time} className="bg-espresso">
                    {t.reservation.atTime(time)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.reservation.guests} className="sm:col-span-2">
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: MAX_ONLINE_GUESTS }, (_, i) => String(i + 1)).map((g) => (
                  <label key={g} className="cursor-pointer">
                    <input type="radio" name="guests" value={g} defaultChecked={g === "2"} aria-label={t.reservation.persons(Number(g))} className="peer sr-only" />
                    <span aria-hidden className="grid h-11 w-11 place-items-center border border-cream/25 text-sm transition-colors duration-200 hover:border-gold peer-checked:border-gold peer-checked:bg-gold peer-checked:text-espresso peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                      {g}
                    </span>
                  </label>
                ))}
              </div>
              <GroupHint dark className="mt-4" />
            </Field>
            <Field label={t.reservation.requests} className="sm:col-span-2">
              <textarea name="special_requests" rows={3} maxLength={500} className={`${inputCls} resize-none`} placeholder={t.reservation.requestsPlaceholder} />
            </Field>
            <ReservationPrivacyNote dark className="-mb-4 max-w-xl sm:col-span-2" />
            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={pending}
                className="press bg-gold px-10 py-5 text-[0.72rem] uppercase tracking-[0.28em] text-espresso hover:bg-cream disabled:opacity-60"
              >
                {pending ? t.reservation.sending : t.reservation.submit}
              </button>
              {state && (
                <p key={state.message} role="status" className={`animate-in fade-in slide-in-from-bottom-1 font-serif text-xl italic duration-300 ${state.ok ? "text-gold" : "text-red-300"}`}>
                  {state.message}
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const { t, href } = useI18n();
  const links: [string, string][] = [
    [t.footer.links.home, "#top"],
    [t.footer.links.menu, "#menu"],
    [t.footer.links.story, "#story"],
    [t.footer.links.visit, "#visit"],
    [t.footer.links.reserve, "#reserve"],
    [t.footer.links.join, href("/join")],
  ];
  return (
    <footer className="border-t border-cream/10 bg-espresso text-cream/70">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 md:grid-cols-12 md:px-12">
        <div className="md:col-span-4">
          <p className="font-serif text-4xl tracking-[0.3em] text-cream">AURÉA</p>
          <p className="mt-4 font-serif text-xl italic">{t.footer.tagline}</p>
        </div>
        <nav className="flex flex-col gap-3 text-sm md:col-span-2">
          {links.map(([l, h]) =>
            h === "#reserve" ? (
              <ReserveLink key={l} className="link-line w-fit hover:text-cream">{l}</ReserveLink>
            ) : (
              <a key={l} href={h} className="link-line w-fit hover:text-cream">{l}</a>
            ),
          )}
        </nav>
        <div className="text-sm leading-relaxed md:col-span-3">
          <p className="eyebrow mb-4 text-gold">{t.footer.contact}</p>
          {CONTACT.street}
          <br />
          {CONTACT.city}
          <br />
          {CONTACT.phone}
        </div>
        <div className="text-sm leading-relaxed md:col-span-3">
          <p className="eyebrow mb-4 text-gold">{t.footer.hours}</p>
          {t.footer.hoursLines.map((line) => (
            <span key={line} className="block">{line}</span>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 border-t border-cream/10 px-6 py-8 text-xs sm:flex-row md:px-12">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <p>{t.footer.copyright}</p>
          {/* The privacy policy exists in German only until a verified translation is ready. */}
          <Link href="/datenschutz" hrefLang="de" className="link-line hover:text-cream">
            {t.footer.privacy}
            {t.footer.germanOnly && ` ${t.footer.germanOnly}`}
          </Link>
          <CookieSettingsButton className="link-line hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold" />
        </div>
        <div className="flex gap-6 uppercase tracking-[0.2em]">
          {["Instagram", "Facebook", "TikTok"].map((s) => (
            <a key={s} href="#top" className="link-line hover:text-gold">{s}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function HomePage({ menu, account }: { menu: PublicCategory[]; account: AccountLink }) {
  useReveal();
  useRestoreScroll();
  return (
    <ReservationModalProvider>
      <main className="bg-background">
        <Header account={account} />
        <Hero />
        <Intro />
        <Chapters />
        <Story />
        <Menu menu={menu} />
        <Atmosphere />
        <Visit />
        <Reservation />
        <Footer />
      </main>
    </ReservationModalProvider>
  );
}
