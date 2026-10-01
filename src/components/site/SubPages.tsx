"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import type { StaticImageData } from "next/image";

import { FloatingReserve, Footer, Header, Menu, Reveal, Visit, useReveal } from "@/components/home/HomePage";
import { ReservationModalProvider, ReserveLink } from "@/components/home/ReservationModal";
import { useI18n } from "@/i18n/client";
import { useRestoreScroll } from "@/i18n/switch";
import type { PublicCategory } from "@/lib/menu";
import {
  FEATURED_FOOD,
  KITCHEN_PHOTOS,
  OPENING_PHOTOS,
  crowd,
  facade,
  owner,
  prosecco,
  staff,
} from "@/lib/photos";

/** Frame shared by the pages besides the landing page: header, a dark title band, footer. */
function SubPage({
  eyebrow,
  title,
  titleEm,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  titleEm: string;
  text?: string;
  children: ReactNode;
}) {
  useReveal();
  useRestoreScroll();
  return (
    <ReservationModalProvider>
      <main className="bg-background">
        <Header onHome={false} />
        {/* Dark band, so the transparent header (cream text) stays readable before scrolling. */}
        <section className="bg-espresso pb-20 pt-40 text-cream md:pb-28 md:pt-52">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <Reveal>
              <p className="eyebrow text-gold">{eyebrow}</p>
              <h1 className="mt-6 font-serif text-6xl font-light leading-[0.98] md:text-9xl">
                {title} <em className="text-gold">{titleEm}</em>
              </h1>
              <div className="my-8 h-px w-16 bg-gold" aria-hidden />
              {text && <p className="max-w-xl text-lg leading-relaxed text-cream/75">{text}</p>}
            </Reveal>
          </div>
        </section>
        {children}
        <Footer onHome={false} />
        <FloatingReserve />
      </main>
    </ReservationModalProvider>
  );
}

const arrowLink =
  "group inline-flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.25em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

/* ---------------- /karte ---------------- */

export function MenuPage({ menu }: { menu: PublicCategory[] }) {
  const { t } = useI18n();
  const p = t.pages.menu;
  return (
    <SubPage eyebrow={p.eyebrow} title={p.title} titleEm={p.titleEm} text={p.text}>
      <Menu menu={menu} standalone />
    </SubPage>
  );
}

/* ---------------- /anfahrt ---------------- */

export function VisitPage() {
  const { t } = useI18n();
  return (
    <SubPage eyebrow={t.visit.eyebrow} title={t.visit.title} titleEm={t.visit.titleEm}>
      <Visit standalone />
    </SubPage>
  );
}

/* ---------------- /ueber-uns ---------------- */

export function AboutPage() {
  const { t, href } = useI18n();
  const p = t.pages.about;
  const opening = [facade, crowd, prosecco];
  return (
    <SubPage eyebrow={p.eyebrow} title={p.title} titleEm={p.titleEm}>
      <section className="mx-auto grid max-w-[1100px] items-center gap-10 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-12 md:py-36">
        <Reveal className="md:col-span-5">
          <div className="relative mx-auto max-w-[320px] md:max-w-none">
            <img
              src={staff.src}
              alt={t.story.imageAlt}
              loading="lazy"
              width={staff.width}
              height={staff.height}
              className="aspect-[4/5] w-full object-cover object-[center_55%]"
            />
            <span aria-hidden className="pointer-events-none absolute inset-3 border border-gold/50" />
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={150}>
          <p className="eyebrow text-gold">{t.story.eyebrow}</p>
          <div className="mt-6 space-y-6">
            <p className="font-serif text-2xl font-light leading-snug md:text-3xl">{t.story.p1}</p>
            <p className="leading-relaxed text-muted-foreground">{t.story.p2}</p>
          </div>
        </Reveal>
      </section>

      <section className="bg-muted/50 py-24 md:py-36" aria-labelledby="host-name">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 px-6 md:grid-cols-12 md:gap-16 md:px-12">
          <Reveal className="md:col-span-5">
            <div className="relative mx-auto max-w-[320px] md:max-w-none">
              <img
                src={owner.src}
                alt={p.hostAlt}
                loading="lazy"
                width={owner.width}
                height={owner.height}
                className="aspect-[4/5] w-full object-cover"
              />
              <span aria-hidden className="pointer-events-none absolute inset-3 border border-gold/50" />
            </div>
          </Reveal>
          <Reveal className="md:col-span-7" delay={150}>
            <p className="eyebrow text-gold">{p.hostEyebrow}</p>
            <h2 id="host-name" className="mt-4 font-serif text-5xl font-light leading-none md:text-7xl">
              {p.hostName}
            </h2>
            <p className="eyebrow mt-4 text-muted-foreground">{p.hostRole}</p>
            <div className="my-8 h-px w-16 bg-gold" aria-hidden />
            <p className="max-w-xl leading-relaxed text-muted-foreground">{p.hostText}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-24 md:px-12 md:py-36">
        <Reveal>
          <h2 className="font-serif text-4xl font-light italic md:text-5xl">{p.valuesTitle}</h2>
        </Reveal>
        <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
          {p.values.map((v, i) => (
            <li key={v.title}>
              <Reveal delay={i * 120}>
                <span className="font-serif text-lg italic text-gold" aria-hidden>
                  {["I", "II", "III"][i]}
                </span>
                <h3 className="mt-3 border-b border-border pb-4 font-serif text-3xl font-light">{v.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-espresso py-24 text-cream md:py-32">
        <div className="mx-auto max-w-[1100px] px-6 md:px-12">
          <Reveal className="text-center">
            <h2 className="font-serif text-4xl font-light md:text-6xl">{p.openingTitle}</h2>
            <p className="mx-auto mt-6 max-w-lg text-cream/70">{p.openingText}</p>
          </Reveal>
          <ul className="mt-14 grid grid-cols-3 gap-3 md:gap-5">
            {opening.map((img, i) => (
              <li key={i}>
                <Reveal delay={i * 100}>
                  <img
                    src={img.src}
                    alt={t.opening.alts[OPENING_PHOTOS.indexOf(img)]}
                    loading="lazy"
                    width={640}
                    height={428}
                    className="aspect-[3/2] w-full object-cover"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            <Link href={href("/galerie")} className={arrowLink}>
              <span className="link-line">{p.toGallery}</span>
              <span className="h-px w-10 origin-left bg-gold transition-transform duration-500 ease-aurea group-hover:scale-x-150" />
            </Link>
            <Link href={href("/karte")} className={arrowLink}>
              <span className="link-line">{p.toMenu}</span>
              <span className="h-px w-10 origin-left bg-gold transition-transform duration-500 ease-aurea group-hover:scale-x-150" />
            </Link>
            <ReserveLink className="press bg-cream px-8 py-4 text-[0.7rem] uppercase tracking-[0.25em] text-espresso transition-colors duration-500 hover:bg-gold">
              {t.nav.reserve}
            </ReserveLink>
          </div>
        </div>
      </section>
    </SubPage>
  );
}

/* ---------------- /galerie ---------------- */

type Photo = { img: StaticImageData; alt: string; group: "food" | "opening" };
type Filter = "all" | "food" | "opening";

export function GalleryPage() {
  const { t } = useI18n();
  const p = t.pages.gallery;
  const [filter, setFilter] = useState<Filter>("all");
  const [current, setCurrent] = useState<number | null>(null);

  const foodAlts = [
    ...t.chapters.map((c) => c.alt),
    ...t.atmosphere.alts.slice(1),
    ...t.kitchen.dishes,
  ];
  const photos: Photo[] = [
    ...[...FEATURED_FOOD, ...KITCHEN_PHOTOS].map((img, i) => ({
      img,
      alt: foodAlts[i] ?? "",
      group: "food" as const,
    })),
    ...OPENING_PHOTOS.map((img, i) => ({ img, alt: t.opening.alts[i] ?? "", group: "opening" as const })),
  ];
  const shown = photos.filter((ph) => filter === "all" || ph.group === filter);
  const open = current !== null ? shown[current] : undefined;
  const step = (d: 1 | -1) =>
    setCurrent((c) => (c === null ? c : (c + d + shown.length) % shown.length));

  // Arrow keys move through the photos while the viewer is open.
  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- step only depends on shown.length
  }, [current, shown.length]);

  return (
    <SubPage eyebrow={p.eyebrow} title={p.title} titleEm={p.titleEm} text={p.text}>
      <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-28">
        <div role="group" aria-label={p.filterLabel} className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border">
          {(["all", "food", "opening"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`relative pb-4 text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${
                filter === f ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.filters[f]}
              <span
                aria-hidden
                className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold transition-transform duration-500 ease-aurea ${
                  filter === f ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {shown.map((ph, i) => (
            <li key={`${ph.group}-${ph.img.src}`}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`${p.open} ${ph.alt}`}
                className="group block w-full overflow-hidden bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <img
                  src={ph.img.src}
                  alt=""
                  loading="lazy"
                  width={ph.img.width}
                  height={ph.img.height}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-[1200ms] ease-aurea group-hover:scale-[1.04]"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <DialogPrimitive.Root open={current !== null} onOpenChange={(o) => !o && setCurrent(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-espresso/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 outline-none md:p-10"
            onClick={(e) => e.target === e.currentTarget && setCurrent(null)}
          >
            <DialogPrimitive.Title className="sr-only">{p.dialog}</DialogPrimitive.Title>
            {open && (
              <figure className="flex max-h-full max-w-full flex-col items-center gap-4">
                <img
                  src={open.img.src}
                  alt={open.alt}
                  // Never larger than the file itself: the opening photos are only 640 px wide.
                  style={{ maxWidth: open.img.width }}
                  className="max-h-[78vh] w-auto max-w-full object-contain"
                />
                <figcaption className="max-w-xl text-center font-serif text-lg italic text-cream/80">
                  {open.alt}
                </figcaption>
              </figure>
            )}
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={p.prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 border border-cream/30 p-3 text-cream transition-colors hover:bg-cream hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:left-8"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={p.next}
              className="absolute right-3 top-1/2 -translate-y-1/2 border border-cream/30 p-3 text-cream transition-colors hover:bg-cream hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:right-8"
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
            <DialogPrimitive.Close
              aria-label={p.close}
              className="absolute right-3 top-3 border border-cream/30 p-3 text-cream transition-colors hover:bg-cream hover:text-espresso focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:right-8 md:top-8"
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </SubPage>
  );
}
