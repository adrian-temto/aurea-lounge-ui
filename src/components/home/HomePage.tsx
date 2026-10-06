"use client";

import { Fragment, useActionState, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createReservation } from "@/app/actions/reservations";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GoogleMap } from "@/components/site/GoogleMap";
import { StaffIcon } from "@/components/site/StaffIcon";
import { useI18n } from "@/i18n/client";
import { useCarryOver, useRestoreScroll } from "@/i18n/switch";
import { CONTACT, MAX_ONLINE_GUESTS, TIME_SLOTS, todayInBerlin } from "@/lib/reservation";
import type { Localized, PublicCategory, PublicItem } from "@/lib/menu";
import {
  GroupHint,
  ReservationConsents,
  ReservationModalProvider,
  ReservationPrivacyNote,
  ReserveLink,
  useSavedContact,
} from "./ReservationModal";
import { EuDateInput } from "./EuDateInput";
import { TimeSelect } from "./TimeSelect";
import hero from "@/assets/hero-bar-lilies.jpg";
import {
  atmosphere as atmos,
  avocadoToast,
  burrata,
  cheesecake,
  ciabatta,
  KITCHEN_PHOTOS,
  OPENING_PHOTOS,
  porridge,
  loungePortrait as story,
  tagliatelle,
} from "@/lib/photos";

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          // Also reveal sections that were scrolled past (anchor jump, restored scroll position,
          // fast scroll): they never intersect, so they would stay invisible when scrolling back up.
          const passed = !!e.rootBounds && e.boundingClientRect.bottom <= e.rootBounds.top;
          if (e.isIntersecting || passed) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.05, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
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

/** Hash links point into the home page; on other pages they go back to it first. */
function useLinkTo(onHome: boolean) {
  const { href } = useI18n();
  return (h: string) => (h.startsWith("#") ? (onHome ? h : `${href("/")}${h}`) : href(h));
}

/** The team login is a page of the site itself. */
const ADMIN_LOGIN_PATH = "/login";

/** Login as a button under the links of the mobile menu. */
function MenuLoginButton({ open, delay }: { open: boolean; delay: number }) {
  const { t } = useI18n();
  return (
    <a
      href={ADMIN_LOGIN_PATH}
      className={`press mt-4 flex w-fit items-center gap-3 border border-foreground px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.25em] transition-[opacity,transform,background-color,color] ease-aurea hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background ${
        open ? "translate-y-0 opacity-100 duration-700" : "translate-y-6 opacity-0 duration-150"
      }`}
      style={{ transitionDelay: open ? `${delay}ms` : "0ms" }}
    >
      <StaffIcon className="size-[18px]" />
      {t.nav.staffLogin}
    </a>
  );
}

function StaffLoginLink({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <a
      href={ADMIN_LOGIN_PATH}
      aria-label={t.nav.staffLogin}
      title={t.nav.staffLogin}
      className={`press flex h-11 w-11 shrink-0 items-center justify-center opacity-70 transition-opacity hover:text-gold hover:opacity-100 focus-visible:opacity-100 ${className}`}
    >
      <StaffIcon className="size-[18px]" />
    </a>
  );
}

export function Header({ onHome = true }: { onHome?: boolean }) {
  const { t } = useI18n();
  const to = useLinkTo(onHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Slides away while reading downwards and returns on the first scroll up.
  const [hidden, setHidden] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const lastY = useRef(0);
  const openRef = useRef(false);
  openRef.current = open;
  useEffect(() => {
    lastY.current = window.scrollY;
    const f = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      const dy = y - lastY.current;
      // lastY only moves when the bar changes state, so slow scrolling still adds up to a decision.
      if (openRef.current || y < 80) {
        setHidden(false);
        lastY.current = y;
      } else if (dy > 6) {
        setHidden(true);
        lastY.current = y;
      } else if (dy < -4) {
        setHidden(false);
        lastY.current = y;
      }
    };
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
        onFocusCapture={() => setHidden(false)}
        className={`nav-drop right-scroll-bar-position fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color,padding,translate] duration-500 ease-aurea ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "bg-background/95 py-4 text-foreground backdrop-blur-md border-b border-border" : "py-7 text-cream"}`}
      >
        <span aria-hidden className="nav-progress absolute inset-x-0 bottom-0 h-px origin-left bg-gold" />
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12">
          <a href={to("#top")} aria-label={t.nav.home} className="block shrink-0">
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
            {t.nav.items.map(([l, h], i) => (
              <a key={l} href={to(h)} style={step(i)} className="nav-in link-line whitespace-nowrap text-[0.72rem] uppercase tracking-[0.18em] xl:tracking-[0.22em]">
                {l}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            <LanguageSwitcher className="text-[0.72rem]" />
            <StaffLoginLink className="-mx-3" />
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
        data-open={open}
        className="menu-sheet fixed inset-0 z-40 flex flex-col justify-between bg-background px-8 pb-10 pt-32 lg:hidden"
      >
        <nav className="flex flex-col gap-4">
          {t.nav.items.map(([l, h], i) => (
            <a
              key={l}
              href={to(h)}
              onClick={() => setOpen(false)}
              className={`group/link flex w-fit items-baseline gap-4 font-serif text-5xl font-light transition-[opacity,transform,color,filter] ease-aurea hover:text-gold focus-visible:text-gold focus-visible:outline-none ${
                open ? "translate-y-0 opacity-100 blur-0 duration-700" : "translate-y-6 opacity-0 blur-md duration-150"
              }`}
              style={{ transitionDelay: open ? `${260 + i * 70}ms` : "0ms" }}
            >
              <span aria-hidden className="font-sans text-[0.65rem] tracking-[0.2em] text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l}
            </a>
          ))}
          <MenuLoginButton open={open} delay={260 + t.nav.items.length * 70} />
        </nav>
        <div
          className={`transition-[opacity,transform] ease-aurea ${open ? "translate-y-0 opacity-100 duration-700" : "translate-y-6 opacity-0 duration-150"}`}
          style={{ transitionDelay: open ? `${260 + t.nav.items.length * 70 + 60}ms` : "0ms" }}
        >
          <div className={`mb-6 h-px w-16 origin-left bg-gold transition-transform duration-1000 ease-aurea ${open ? "scale-x-100 delay-700" : "scale-x-0 delay-0"}`} />
          <ReserveLink returnFocus={menuButton} onClick={() => setOpen(false)} className="press block bg-foreground py-4 text-center text-xs uppercase tracking-[0.25em] text-background hover:bg-gold hover:text-foreground">
            {t.nav.reserve}
          </ReserveLink>
          <p className="mt-6 text-sm text-muted-foreground">{t.nav.address}</p>
        </div>
      </div>
    </>
  );
}

/** Stagger offset for the hero's entrance (see .hero-rise in globals.css). */
const rise = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Letters rise one after another out of a blur. Screen readers get the whole text, not single letters. */
function SplitText({ text, start = 0, step = 38, letterClass = "hero-letter" }: { text: string; start?: number; step?: number; letterClass?: string }) {
  let n = 0;
  return (
    <span aria-label={text}>
      {text.split(" ").map((word, w, words) => (
        <Fragment key={w}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, i) => (
              <span key={i} className={letterClass} style={{ "--d": `${start + n++ * step}ms` } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}

/** Pulls its child a few pixels toward the cursor, then springs back. Mouse and pen only. */
/** Words fade in one by one, sliding up out of a soft blur. Screen readers get the whole sentence. */
function WordReveal({ text, start = 0, step = 32 }: { text: string; start?: number; step?: number }) {
  const words = text.split(" ");
  return (
    <span aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span aria-hidden className="hero-word" style={{ "--d": `${start + i * step}ms` } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}

const HERO_TEXT_START = 1300;
const HERO_WORD_STEP = 32;

function Hero() {
  const { t } = useI18n();
  // The buttons follow once the last word of the description has nearly settled.
  const buttonsAt = HERO_TEXT_START + (t.hero.text.split(" ").length - 1) * HERO_WORD_STEP + 550;
  return (
    // Full-bleed photo with the text over it; the gradient keeps the text readable on the bright bar.
    <section id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-espresso text-cream">
      <img
        src={hero.src}
        alt={t.hero.imageAlt}
        width={hero.width}
        height={hero.height}
        fetchPriority="high"
        className="hero-settle absolute inset-0 h-full w-full object-cover object-[40%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/45 to-espresso/30" aria-hidden />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-[max(3.5rem,env(safe-area-inset-bottom))] md:px-12 md:pb-24">
        <p className="hero-rise eyebrow mb-6 text-gold md:mb-8" style={rise(80)}>{t.hero.eyebrow}</p>
        <h1 className="max-w-4xl font-serif text-[2.9rem] font-light leading-[0.98] sm:text-[3.4rem] md:text-[6.5rem]">
          <span className="block">
            <SplitText text={t.hero.title} start={250} />
          </span>
          <em className="block font-light">
            <SplitText text={t.hero.titleEm} start={250 + Array.from(t.hero.title.replace(/ /g, "")).length * 38 + 120} />
          </em>
        </h1>
        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10">
          <p className="max-w-md text-base leading-relaxed text-cream/80">
            <WordReveal text={t.hero.text} start={HERO_TEXT_START} step={HERO_WORD_STEP} />
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ReserveLink style={rise(buttonsAt)} className="hero-btn btn-modern btn-sheen press bg-cream px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] text-espresso [--btn-fill:var(--gold)]">
              <span>{t.hero.reserve}</span>
              <ArrowRight className="btn-arrow size-3.5" aria-hidden />
            </ReserveLink>
            <a href="#menu" style={rise(buttonsAt + 140)} className="hero-btn btn-modern press border border-cream/50 px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] transition-[color,border-color,transform] duration-500 ease-aurea [--btn-fill:var(--cream)] hover:border-cream hover:text-espresso focus-visible:text-espresso">
              <span>{t.hero.menu}</span>
              <ArrowDown className="btn-arrow-down size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
      <div className="hero-cue pointer-events-none absolute bottom-0 right-6 hidden h-24 w-px overflow-hidden bg-cream/15 md:right-12 md:block" aria-hidden>
        <span className="hero-cue-dot block h-8 w-px bg-gold" />
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
          <h2 className="story-ink font-serif text-6xl font-light leading-none md:text-8xl">
            <Words text={t.intro.title} />
            <em>
              <Words text={t.intro.titleEm} start={t.intro.title.split(" ").length} shimmer />
            </em>
          </h2>
          <p className="story-fade mt-10 max-w-xl font-serif text-2xl font-light leading-snug text-muted-foreground md:text-3xl" style={{ "--f": 0 } as CSSProperties}>{t.intro.text}</p>
          <div className="story-fade mt-14 flex items-center gap-6 text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground" style={{ "--f": 1 } as CSSProperties}>
            <span>08:00</span>
            <span className="gild-line h-px flex-1 bg-gradient-to-r from-gold/20 via-gold to-espresso" />
            <span>20:00</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const CHAPTER_IMAGES = [
  { n: "I", img: avocadoToast },
  { n: "II", img: ciabatta },
  { n: "III", img: tagliatelle },
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
                <article className="group" style={{ "--c": i } as CSSProperties}>
                  <div className={`story-media relative overflow-hidden ${i === 2 ? "bg-espresso" : "bg-muted"}`}>
                    {/* Entry zoom on the wrapper, hover zoom on the photo: both use `scale`. */}
                    <div className="story-zoom">
                      <img src={pic.img.src} alt={c.alt} loading="lazy" width={896} height={1152} className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]" />
                    </div>
                    <div className="story-curtain absolute inset-0 bg-background" aria-hidden />
                    <span className="story-fade absolute left-5 top-5 font-serif text-lg italic text-cream">{pic.n}</span>
                  </div>
                  {/* Wraps on narrow tablet columns, where the time would otherwise stick out of the page. */}
                  <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-border pb-4">
                    <h3 className="font-serif text-4xl font-light md:text-5xl">
                      <Words text={c.title} />
                    </h3>
                    <span className="story-fade eyebrow text-gold">{c.time}</span>
                  </div>
                  <p className="story-fade mt-5 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground" style={{ "--f": 1 } as CSSProperties}>{c.copy}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Headline words rise out of a mask one after another once the block is revealed. */
function Words({ text, start = 0, shimmer = false }: { text: string; start?: number; shimmer?: boolean }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        // The space sits outside the inline-block word: inside it, it collapses and the words run together.
        <Fragment key={i}>
          <span className="story-word">
            <span className={shimmer ? "story-shimmer" : undefined} style={{ "--w": start + i } as CSSProperties}>
              {w}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

function Story() {
  const { t } = useI18n();
  const section = useRef<HTMLElement>(null);
  // A soft gold light follows the pointer across the section (see .story-glow in globals.css).
  const follow = (e: React.PointerEvent<HTMLElement>) => {
    const el = section.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const titleWords = t.story.title.split(" ").length;
  return (
    <section id="story" ref={section} onPointerMove={follow} className="relative isolate overflow-hidden bg-espresso text-cream">
      <div className="story-grid absolute inset-0 -z-10" aria-hidden />
      <div className="story-orb story-orb-a absolute -z-10" aria-hidden />
      <div className="story-orb story-orb-b absolute -z-10" aria-hidden />
      <div className="story-glow absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto grid max-w-[1440px] items-center gap-4 md:grid-cols-2">
        <div className="px-6 pt-24 md:px-16 md:py-36">
          <div className="reveal story-media relative aspect-[4/5] w-full overflow-hidden md:mx-auto md:max-w-[560px]">
            <div className="story-parallax absolute inset-x-0 -inset-y-[8%]">
              <img src={story.src} alt={t.story.imageAlt} loading="lazy" width={story.width} height={story.height} className="story-zoom h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" aria-hidden />
            <div className="story-curtain absolute inset-0 bg-espresso" aria-hidden />
            <div className="pointer-events-none absolute inset-4 border border-gold/40" aria-hidden />
          </div>
          <div className="story-orbit pointer-events-none absolute right-[4%] top-[14%] hidden h-40 w-40 rounded-full border border-gold/25 md:block" aria-hidden>
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gold" />
          </div>
        </div>
        <div className="px-6 pb-24 pt-12 md:px-16 md:py-36">
          <Reveal>
            <p className="eyebrow flex items-center gap-4 text-gold">
              <span className="gild-line h-px w-10 bg-gold" aria-hidden />
              {t.story.eyebrow}
            </p>
            <h2 className="mt-8 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
              <Words text={t.story.title} />
              <br />
              <em>
                <Words text={t.story.titleEm} start={titleWords} shimmer />
              </em>
            </h2>
            <div className="my-10 flex items-center gap-3" aria-hidden>
              <span className="gild-line h-px w-16 bg-gold" />
              <span className="gild-dot h-1.5 w-1.5 rotate-45 bg-gold" />
            </div>
            <p className="story-fade max-w-lg leading-relaxed text-cream/75" style={{ "--f": 0 } as CSSProperties}>{t.story.p1}</p>
            <p className="story-fade mt-6 max-w-lg leading-relaxed text-cream/75" style={{ "--f": 1 } as CSSProperties}>{t.story.p2}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Menu({ menu, standalone = false }: { menu: PublicCategory[]; standalone?: boolean }) {
  const { t, href } = useI18n();
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
    <section id="menu" className={`mx-auto max-w-[1440px] px-6 md:px-12 ${standalone ? "pb-28 pt-16 md:pb-44 md:pt-20" : "py-28 md:py-44"}`}>
      {!standalone && (
      <Reveal className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow text-muted-foreground">{t.menu.eyebrow}</p>
          <h2 className="mt-4 font-serif text-7xl font-light italic leading-none md:text-9xl">
            <SplitText text={t.menu.title} start={150} step={40} letterClass="reveal-letter" />
          </h2>
        </div>
      </Reveal>
      )}
      <Reveal className={`no-scrollbar -mx-6 flex gap-8 overflow-x-auto border-b border-border px-6 md:mx-0 md:px-0 ${standalone ? "" : "mt-16"}`} delay={200}>
        {menu.map((c, i) => (
          <button
            key={c.id}
            style={{ "--i": i } as CSSProperties}
            onClick={() => {
              setCatId(c.id);
              setChanged(true);
            }}
            aria-pressed={cat?.id === c.id}
            className={`menu-tab group relative shrink-0 pb-5 text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-300 focus-visible:text-foreground focus-visible:outline-none ${
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
      </Reveal>
      <Reveal>
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
      </Reveal>
      {!standalone && (
      <div className="mt-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <a href={href("/karte")} className="group inline-flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.25em]">
          <span className="link-line">{t.menu.fullMenu}</span>
          <span className="h-px w-10 origin-left bg-gold transition-transform duration-500 ease-aurea group-hover:scale-x-150 group-focus-visible:scale-x-150" />
        </a>
      </div>
      )}
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
          className={`group relative flex gap-4 border-b border-border py-8 ${animate ? "dish-in" : "dish-item"}`}
          style={{ "--i": i } as CSSProperties}
        >
          {it.image && (
            <span className="size-16 shrink-0 overflow-hidden md:size-20">
              <img src={it.image} alt="" loading="lazy" className={`size-full object-cover transition-transform duration-700 ease-aurea group-hover:scale-105 ${it.available ? "" : "opacity-50 grayscale"}`} />
            </span>
          )}
          <span aria-hidden className="dish-line" />
          <div className="min-w-0 flex-1 transition-transform duration-500 ease-aurea group-hover:translate-x-1.5">
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
              <span className={`whitespace-nowrap text-sm tabular-nums transition-colors duration-300 ${it.available ? "group-hover:text-gold" : "text-muted-foreground line-through"}`}>€{it.price}</span>
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
  { src: cheesecake, cls: "md:col-span-4 aspect-square" },
  { src: porridge, cls: "md:col-span-3 md:mt-24 aspect-[4/5]" },
  // No negative margins: a tile pulled up over the big photo overlapped it (and its hover zoom).
  { src: burrata, cls: "col-span-2 md:col-span-5 aspect-[4/5]" },
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
            <SplitText text={t.atmosphere.title} start={150} step={36} letterClass="reveal-letter" />
            <br />
            <em className="text-gold">
              <SplitText text={t.atmosphere.titleEm} start={150 + t.atmosphere.title.length * 36 + 100} step={36} letterClass="reveal-letter" />
            </em>
          </h2>
        </Reveal>
        {/* The photo spans the full content width; its parallax overscan stays small so the 1534 px source holds up. */}
        <div ref={ref} className="reveal atmos-media relative aspect-[16/10] overflow-hidden md:aspect-[2/1]">
          {/* The clip lives on this inner layer: the observed .reveal box itself is never clipped away. */}
          <div className="atmos-clip absolute inset-0 overflow-hidden">
            <img src={atmos.src} alt={t.atmosphere.alts[0]} loading="lazy" width={atmos.width} height={atmos.height} ref={img} className="absolute inset-x-0 -top-[5%] h-[110%] w-full object-cover will-change-transform" />
            <span aria-hidden className="atmos-frame pointer-events-none absolute inset-4 border border-cream/40 md:inset-8" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-12 md:gap-8">
          {GALLERY.map((im, i) => (
            // isolate + overflow-hidden keep the hover zoom inside the tile's own box.
            <Reveal key={i} delay={i * 120} className={`group relative isolate overflow-hidden ${im.cls}`}>
              <img src={im.src.src} alt={t.atmosphere.alts[i + 1]} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Opening hours, address and map. Lives on its own page (/anfahrt), whose title band replaces the heading. */
export function Visit({ standalone = false }: { standalone?: boolean }) {
  const { t } = useI18n();
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTACT.mapsQuery)}`;
  return (
    <section id="visit" className={`mx-auto max-w-[1440px] px-6 md:px-12 ${standalone ? "pb-28 pt-16 md:pb-44 md:pt-20" : "py-28 md:py-44"}`}>
      <div className="grid gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          {!standalone && (
            <>
          <p className="eyebrow text-muted-foreground">{t.visit.eyebrow}</p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
            <SplitText text={t.visit.title} start={150} step={36} letterClass="reveal-letter" />
            <br />
            <em>
              <SplitText text={t.visit.titleEm} start={150 + t.visit.title.length * 36 + 100} step={36} letterClass="reveal-letter" />
            </em>
          </h2>
            </>
          )}
          <dl className={`divide-y divide-border border-y border-border ${standalone ? "" : "mt-14"}`}>
            {t.visit.hours.map(([d, time], i) => (
              <div key={d} className="visit-in flex justify-between py-5 text-sm" style={step(i)}>
                <dt className="text-muted-foreground">{d}</dt>
                <dd className="tabular-nums">{time}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div className="visit-in" style={step(2)}>
              <p className="eyebrow mb-3 text-gold">{t.visit.address}</p>
              <p className="leading-relaxed">
                {CONTACT.street}
                <br />
                {CONTACT.city}, {t.visit.country}
              </p>
            </div>
            <div className="visit-in" style={step(3)}>
              <p className="eyebrow mb-3 text-gold">{t.visit.phone}</p>
              <a href={CONTACT.phoneHref} className="link-line">{CONTACT.phone}</a>
              <br />
              <a href={`mailto:${CONTACT.email}`} className="link-line mt-2 inline-block break-all">
                {CONTACT.email}
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={150}>
          {/* The real map (Google Maps, after consent). The button sits below it, not on it,
              so Google's controls and attribution stay visible. */}
          <div className="map-card relative aspect-[4/5] overflow-hidden border border-border bg-card sm:aspect-[4/3] md:aspect-auto md:h-[calc(100%-4.5rem)] md:min-h-[480px]">
            <GoogleMap />
          </div>
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-4 flex min-h-11 w-full items-center justify-center bg-foreground px-7 py-4 text-[0.7rem] uppercase tracking-[0.25em] text-background hover:bg-gold hover:text-foreground sm:ml-auto sm:w-fit"
          >
            {t.visit.directions}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/** Index for the form's staggered entrance (see .res-field in globals.css). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

function Field({ label, children, className = "", i = 0 }: { label: string; children: ReactNode; className?: string; i?: number }) {
  return (
    <label className={`res-field relative block ${className}`} style={step(i)}>
      <span className="res-label eyebrow text-cream/50">{label}</span>
      {children}
      <span aria-hidden className="res-line" />
    </label>
  );
}
const inputCls =
  "mt-1 w-full min-w-0 border-0 border-b border-cream/25 bg-transparent pb-2 text-base md:mt-3 md:pb-3 text-cream outline-none transition-colors duration-500 placeholder:text-cream/30 focus:border-gold [color-scheme:dark]";

type Selection = { date: string; time: string; guests: string };

function Reservation() {
  const { locale, t } = useI18n();
  const [state, formAction, pending] = useActionState(createReservation, null);
  const form = useRef<HTMLFormElement>(null);
  const saveContact = useSavedContact(form);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  // Date, time and guest count survive a language switch; contact details are not carried over.
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
      setDate(s.date);
      if (TIME_SLOTS.includes(s.time)) setTime(s.time);
      const guests = el.namedItem("guests") as HTMLSelectElement;
      if (Array.from(guests.options).some((o) => o.value === s.guests)) guests.value = s.guests;
    },
  );
  return (
    <section id="reserve" className="bg-espresso text-cream">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-6 py-10 md:grid-cols-12 md:gap-16 md:px-12 md:py-40">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-gold">{t.reservation.eyebrow}</p>
          <h2 className="mt-3 font-serif text-4xl font-light leading-none md:mt-6 md:text-8xl">
            <SplitText text={t.reservation.title} start={150} step={34} letterClass="reveal-letter" />{" "}
            <em>
              <SplitText text={t.reservation.titleEm} start={150 + t.reservation.title.length * 34 + 80} step={34} letterClass="reveal-letter" />
            </em>
          </h2>
          <div className="mt-12 hidden items-center gap-3 md:flex" aria-hidden>
            <span className="gild-line h-px w-12 bg-gold" />
            <span className="gild-dot h-1.5 w-1.5 rotate-45 bg-gold" />
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={150}>
          <form ref={form} action={formAction} onSubmit={saveContact} className="grid grid-cols-2 gap-x-5 gap-y-5 md:gap-x-10 md:gap-y-10">
            <input type="hidden" name="locale" value={locale} />
            <Field label={t.reservation.name} i={0}>
              <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputCls} placeholder={t.reservation.namePlaceholder} />
            </Field>
            <Field label={t.reservation.phone} i={1}>
              <input name="phone" type="tel" required minLength={5} maxLength={30} autoComplete="tel" className={inputCls} placeholder="+49" />
            </Field>
            <Field label={t.reservation.email} className="col-span-2" i={2}>
              <input name="email" type="email" required maxLength={254} autoComplete="email" className={inputCls} placeholder={t.reservation.emailPlaceholder} />
            </Field>
            <Field label={t.reservation.date} i={3}>
              <EuDateInput name="date" value={date} onChange={setDate} min={todayInBerlin()} required className={inputCls} />
            </Field>
            <Field label={t.reservation.time} i={4}>
              <TimeSelect
                name="time"
                slots={TIME_SLOTS}
                value={time}
                onChange={setTime}
                hourClassName={inputCls}
                minuteClassName={inputCls}
                optionClassName="bg-espresso"
              />
            </Field>
            <div className="col-span-2">
              <Field label={t.reservation.guests} i={5}>
                <select name="guests" className={inputCls} defaultValue="2">
                  {Array.from({ length: MAX_ONLINE_GUESTS }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g} className="bg-espresso">
                      {t.reservation.persons(g)}
                    </option>
                  ))}
                </select>
              </Field>
              <GroupHint dark className="res-field mt-3" />
            </div>
            <Field label={t.reservation.requests} className="col-span-2" i={6}>
              <textarea name="special_requests" rows={2} maxLength={500} className={`${inputCls} resize-none`} placeholder={t.reservation.requestsPlaceholder} />
            </Field>
            <ReservationConsents dark className="res-field col-span-2" />
            <ReservationPrivacyNote dark className="res-field -mb-2 col-span-2 max-w-xl md:-mb-4" />
            <div className="res-field col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" style={step(9)}>
              <button
                type="submit"
                disabled={pending}
                className="res-cta press relative w-full overflow-hidden bg-gold px-10 py-4 text-[0.72rem] sm:w-auto md:py-5 uppercase tracking-[0.28em] text-espresso hover:bg-cream disabled:opacity-60"
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

export function Footer({ onHome = true }: { onHome?: boolean }) {
  const { t, href } = useI18n();
  const to = useLinkTo(onHome);
  const links: [string, string][] = [
    [t.footer.links.home, "#top"],
    [t.footer.links.menu, "/karte"],
    [t.footer.links.about, "/ueber-uns"],
    [t.footer.links.gallery, "/galerie"],
    [t.footer.links.visit, "/anfahrt"],
    [t.footer.links.reserve, "#reserve"],
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
              <a key={l} href={to(h)} className="link-line w-fit hover:text-cream">{l}</a>
            ),
          )}
        </nav>
        <div className="text-sm leading-relaxed md:col-span-3">
          <p className="eyebrow mb-4 text-gold">{t.footer.contact}</p>
          {CONTACT.street}
          <br />
          {CONTACT.city}
          <br />
          <a href={CONTACT.phoneHref} className="link-line hover:text-cream">{CONTACT.phone}</a>
          <br />
          <a href={`mailto:${CONTACT.email}`} className="link-line hover:text-cream">{CONTACT.email}</a>
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
          <Link href={href("/datenschutz")} className="link-line hover:text-cream">
            {t.footer.privacy}
          </Link>
          <Link href={href("/impressum")} className="link-line hover:text-cream">
            {t.footer.imprint}
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

/** Bottom-left shortcut to the reservation dialog; appears as soon as the page is scrolled. */
export function FloatingReserve() {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const f = () => setShown(window.scrollY > 0);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <ReserveLink
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
      className={`press fixed bottom-5 right-5 z-40 flex items-center gap-3 border border-gold/40 bg-espresso px-5 py-3.5 text-[0.68rem] uppercase tracking-[0.25em] text-cream shadow-2xl transition-[opacity,transform,background-color,color] duration-500 ease-aurea hover:bg-gold hover:text-espresso md:bottom-8 md:right-8${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="size-1.5 rounded-full bg-gold" aria-hidden />
      <span>{t.nav.reserve}</span>
    </ReserveLink>
  );
}

const KITCHEN = KITCHEN_PHOTOS.map((img, i) => ({
  img,
  span: ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3"][i]!,
}));

/** The remaining kitchen photos, as a plain grid under the menu. */
function Kitchen() {
  const { t } = useI18n();
  return (
    <section id="kitchen" className="bg-muted/50 py-28 md:py-40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow text-muted-foreground">{t.kitchen.eyebrow}</p>
            <h2 className="mt-4 font-serif text-6xl font-light leading-none md:text-8xl">
              {t.kitchen.title} <em className="text-gold">{t.kitchen.titleEm}</em>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground md:col-span-5">{t.kitchen.text}</p>
        </Reveal>
        <ul className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
          {KITCHEN.map((d, i) => (
            <li key={i} className={`group ${d.span}`}>
              <Reveal delay={(i % 3) * 100}>
                <div className="overflow-hidden bg-muted">
                  <img
                    src={d.img.src}
                    alt={t.kitchen.dishes[i]}
                    loading="lazy"
                    width={1197}
                    height={799}
                    className="aspect-[3/2] w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-3 font-serif text-lg font-light italic leading-snug md:text-xl">
                  {t.kitchen.dishes[i]}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const OPENING = OPENING_PHOTOS;

/** Photos from the opening evening. They are only 640 px wide, so they stay small on screen. */
function Opening() {
  const { t } = useI18n();
  return (
    <section id="opening" className="py-28 md:py-40">
      <div className="mx-auto max-w-[1100px] px-6 md:px-12">
        <Reveal className="text-center">
          <p className="eyebrow text-muted-foreground">{t.opening.eyebrow}</p>
          <h2 className="mt-4 font-serif text-6xl font-light leading-none md:text-8xl">
            {t.opening.title}
            <br />
            <em className="text-gold">{t.opening.titleEm}</em>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-muted-foreground">{t.opening.text}</p>
        </Reveal>
        <ul className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {OPENING.map((img, i) => (
            <li key={i} className={`group ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
              <Reveal delay={(i % 3) * 100}>
                <div className="overflow-hidden bg-muted">
                  <img
                    src={img.src}
                    alt={t.opening.alts[i]}
                    loading="lazy"
                    width={640}
                    height={428}
                    className="aspect-[3/2] w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]"
                  />
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function HomePage({ menu }: { menu: PublicCategory[] }) {
  useReveal();
  useRestoreScroll();
  return (
    <ReservationModalProvider>
      <main className="bg-background">
        <Header />
        <Hero />
        <Intro />
        <Chapters />
        <Reservation />
        <Story />
        <Menu menu={menu} />
        <Kitchen />
        <Atmosphere />
        <Opening />
        <Footer />
        <FloatingReserve />
      </main>
    </ReservationModalProvider>
  );
}
