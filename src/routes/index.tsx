import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import hero from "@/assets/hero.jpg";
import breakfast from "@/assets/breakfast.jpg";
import cafe from "@/assets/cafe.jpg";
import lounge from "@/assets/lounge.jpg";
import story from "@/assets/story.jpg";
import atmos from "@/assets/atmos.jpg";
import pastry from "@/assets/pastry.jpg";
import cocktail from "@/assets/cocktail.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auréa — Frühstück, Café & Lounge in Beelitz" },
      { name: "description", content: "Eine goldene Stunde, von früh bis spät. Frühstück, Specialty Coffee und eine intime Abend-Lounge in Beelitz." },
      { property: "og:title", content: "Auréa — Frühstück, Café & Lounge" },
      { property: "og:description", content: "Wo Morgenlicht auf Kerzenschein trifft. Come for breakfast, stay for coffee, return for the evening." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.15 },
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

const NAV = [
  ["Home", "#top"],
  ["Breakfast", "#tag"],
  ["Café", "#tag"],
  ["Lounge", "#tag"],
  ["Menu", "#menu"],
  ["Our Story", "#story"],
  ["Visit", "#visit"],
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 60);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const solid = scrolled || open;
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled ? "bg-background/95 py-4 text-foreground backdrop-blur-md border-b border-border" : "py-7 text-cream"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12">
          <a href="#top" className={`font-serif text-2xl tracking-[0.3em] ${open ? "text-foreground" : ""}`}>
            AURÉA
          </a>
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.map(([l, h]) => (
              <a key={l} href={h} className="link-line text-[0.72rem] uppercase tracking-[0.22em]">
                {l}
              </a>
            ))}
          </nav>
          <a
            href="#reserve"
            className={`hidden border px-6 py-3 text-[0.7rem] uppercase tracking-[0.25em] transition-colors duration-500 lg:inline-block ${
              scrolled ? "border-foreground hover:bg-foreground hover:text-background" : "border-cream/60 hover:bg-cream hover:text-espresso"
            }`}
          >
            Reserve a Table
          </a>
          <button
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen(!open)}
            className={`relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[7px] lg:hidden ${solid ? "text-foreground" : ""}`}
          >
            <span className={`h-px w-7 bg-current transition-transform duration-500 ${open ? "translate-y-[4px] rotate-45" : ""}`} />
            <span className={`h-px w-7 bg-current transition-transform duration-500 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-background px-8 pb-10 pt-32 transition-opacity duration-700 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-4">
          {NAV.map(([l, h], i) => (
            <a
              key={l}
              href={h}
              onClick={() => setOpen(false)}
              className="font-serif text-5xl font-light transition-all duration-700"
              style={{ transitionDelay: open ? `${i * 60}ms` : "0ms", transform: open ? "none" : "translateY(16px)", opacity: open ? 1 : 0 }}
            >
              {l}
            </a>
          ))}
        </nav>
        <div>
          <div className="mb-6 h-px w-16 bg-gold" />
          <a href="#reserve" onClick={() => setOpen(false)} className="block bg-foreground py-4 text-center text-xs uppercase tracking-[0.25em] text-background">
            Reserve a Table
          </a>
          <p className="mt-6 text-sm text-muted-foreground">Berlinerstr 196 · Beelitz · +49 33204 634887</p>
        </div>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-espresso text-cream">
      <img src={hero} alt="Auréa Café im Morgenlicht mit Messingdetails und Kerzen" width={1920} height={1088} className="absolute inset-0 h-full w-full scale-105 object-cover animate-[heroZoom_14s_ease-out_forwards]" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-espresso/20" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-16 md:px-12 md:pb-24">
        <p className="eyebrow mb-8 text-gold">Breakfast · Café · Lounge</p>
        <h1 className="max-w-4xl font-serif text-[3.2rem] font-light leading-[0.98] md:text-[6.5rem]">
          Eine goldene Stunde,
          <br />
          <em className="font-light">von früh bis spät.</em>
        </h1>
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <p className="max-w-md text-[0.95rem] leading-relaxed text-cream/80">
            Wo Morgenlicht auf Kerzenschein trifft. Ein warmer Rückzugsort für entspannte Kaffees, gemütliche Frühstücke und ruhige Gespräche.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#reserve" className="bg-cream px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] text-espresso transition-colors duration-500 hover:bg-gold">
              Table reservieren
            </a>
            <a href="#menu" className="border border-cream/50 px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] transition-colors duration-500 hover:border-gold hover:text-gold">
              Karte entdecken
            </a>
          </div>
        </div>
      </div>
      <style>{`@keyframes heroZoom{from{transform:scale(1.12)}to{transform:scale(1.02)}}`}</style>
    </section>
  );
}

function Intro() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <p className="eyebrow text-muted-foreground">Drei Momente, ein Ort</p>
          <div className="mt-6 h-px w-24 bg-gold" />
        </Reveal>
        <Reveal className="md:col-span-8" delay={150}>
          <h2 className="font-serif text-6xl font-light leading-none md:text-8xl">
            Ein Tag bei <em>Auréa</em>
          </h2>
          <p className="mt-10 max-w-xl font-serif text-2xl font-light leading-snug text-muted-foreground md:text-3xl">
            Vom ersten Espresso bis zum letzten Glas Wein — wir halten den Herd warm, durch jeden Moment des Tages.
          </p>
          <div className="mt-14 flex items-center gap-6 text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
            <span>07:00</span>
            <span className="h-px flex-1 bg-gradient-to-r from-gold/20 via-gold to-espresso" />
            <span>01:00</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const CHAPTERS = [
  { n: "I", time: "Ab 07:00", title: "Frühstück", img: breakfast, alt: "Frühstückstisch mit Eggs Benedict und Sauerteigbrot", copy: "Sauerteigbrot, weiche Eier, Steinobstmarmelade und mehr — für einen guten Start in den Tag." },
  { n: "II", time: "Ab 11:00", title: "Café", img: cafe, alt: "Flat White und Croissant auf Marmortisch", copy: "Specialty Coffee, frisches Gebäck und eine volle Mittagskarte für den langen Nachmittag." },
  { n: "III", time: "Ab 18:00", title: "Lounge", img: lounge, alt: "Kerzenlicht, Cocktail und Plattenspieler am Abend", copy: "Kerzenschein, kleine Gerichte, klassische Cocktails und Vinyl, das leise spielt." },
];

function Chapters() {
  return (
    <section id="tag" className="relative">
      <div className="mx-auto max-w-[1440px] px-6 pb-28 md:px-12 md:pb-40">
        <div className="grid gap-16 md:grid-cols-3 md:gap-8">
          {CHAPTERS.map((c, i) => (
            <Reveal key={c.title} delay={i * 150} className={i === 1 ? "md:mt-32" : i === 2 ? "md:mt-64" : ""}>
              <article className="group">
                <div className={`relative overflow-hidden ${i === 2 ? "bg-espresso" : "bg-muted"}`}>
                  <img src={c.img} alt={c.alt} loading="lazy" width={896} height={1152} className="aspect-[4/5] w-full object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-105" />
                  <span className="absolute left-5 top-5 font-serif text-lg italic text-cream">{c.n}</span>
                </div>
                <div className="mt-7 flex items-baseline justify-between border-b border-border pb-4">
                  <h3 className="font-serif text-4xl font-light md:text-5xl">{c.title}</h3>
                  <span className="eyebrow text-gold">{c.time}</span>
                </div>
                <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">{c.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="story" className="bg-card">
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
        <div className="relative min-h-[70vh] overflow-hidden">
          <img src={story} alt="Messingtresen mit frisch gebackenem Sauerteigbrot" loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex items-center px-6 py-24 md:px-20 md:py-36">
          <Reveal>
            <p className="eyebrow text-muted-foreground">Unsere Story</p>
            <h2 className="mt-8 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
              Wärme verwurzelt,
              <br />
              <em>mit Sorgfalt vergoldet.</em>
            </h2>
            <div className="my-10 flex items-center gap-3">
              <span className="h-px w-12 bg-gold" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            </div>
            <p className="max-w-lg leading-relaxed text-muted-foreground">
              Auréa entstand aus einem einfachen Wunsch — einen Raum zu schaffen, der den ganzen Tag trägt. Einen Raum, in dem der Morgen nach Kardamom und dunkel gerösteten Bohnen duftet, in dem der Nachmittag leise über guten Büchern summt, und in dem die Abende golden im Kerzenlicht flackern.
            </p>
            <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
              Jedes Detail — vom Messing, das wir jeden Morgen polieren, bis zum Brot, das wir vor Sonnenaufgang backen — ist mit Bedacht gewählt.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type Item = { name: string; desc: string; price: string; tag?: string };
const MENU: Record<string, Item[]> = {
  Breakfast: [
    { name: "Egg & Avocado Croissant", desc: "Croissant, Rührei, Avocado, Frischkäse, Rucola", price: "13,90", tag: "V" },
    { name: "Eggs Benedict", desc: "Brioche, pochierte Eier, hausgemachte Hollandaise, Babyspinat", price: "13,90" },
    { name: "Kokos-Joghurt-Bowl", desc: "Kokosjoghurt, Mango, Granola", price: "9,90", tag: "VG" },
    { name: "Pistazien-Porridge", desc: "Haferflocken, Pistaziencreme, Pistazien", price: "10,90", tag: "V" },
  ],
  Lunch: [
    { name: "AUREA Bowl", desc: "Quinoa, Avocado, Edamame, Mango, Gurke, Karotte, Sesam", price: "16,90", tag: "VG" },
    { name: "Tagliatelle mit Trüffel & Burrata", desc: "Tagliatelle, Trüffelcreme, Burrata, Parmesan", price: "19,90", tag: "V" },
    { name: "Pinsa Trüffel", desc: "Trüffelcrème, Mozzarella, Parmesan", price: "14,90", tag: "V" },
    { name: "Burrata & Steinobst", desc: "Burrata, Pfirsich, Basilikum, Olivenöl, Sauerteig", price: "13,50", tag: "V" },
  ],
  Desserts: [
    { name: "San Sebastian Cheesecake", desc: "Hausgemachter Cheesecake", price: "7,90" },
    { name: "Pistazien-Tiramisu", desc: "Mascarpone, Espresso, Pistazie", price: "8,50" },
  ],
  Kids: [
    { name: "Kleiner Pfannkuchen", desc: "Ahornsirup, Beeren", price: "6,90" },
    { name: "Mini Pinsa", desc: "Tomate, Mozzarella", price: "7,50" },
  ],
  Coffee: [
    { name: "Espresso", desc: "Hausröstung, dunkle Schokolade, Kirsche", price: "2,80" },
    { name: "Flat White", desc: "Doppelter Espresso, samtige Milch", price: "4,20" },
    { name: "Kardamom Latte", desc: "Espresso, Milch, Kardamom, Honig", price: "4,90" },
  ],
  Tea: [
    { name: "Earl Grey Crème", desc: "Schwarztee, Bergamotte, Vanille", price: "3,90" },
    { name: "Frische Minze", desc: "Marokkanische Minze, Honig", price: "3,90" },
  ],
  Matcha: [
    { name: "Ceremonial Matcha", desc: "Uji, pur aufgeschlagen", price: "5,20" },
    { name: "Iced Strawberry Matcha", desc: "Erdbeere, Hafermilch, Matcha", price: "5,90" },
  ],
  "Cold Drinks": [
    { name: "Hausgemachte Limonade", desc: "Zitrone, Rosmarin", price: "4,50" },
    { name: "Espresso Tonic", desc: "Tonic, Espresso, Orangenzeste", price: "4,90" },
  ],
};

function Menu() {
  const cats = Object.keys(MENU);
  const [cat, setCat] = useState("Breakfast");
  return (
    <section id="menu" className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
      <Reveal className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow text-muted-foreground">Eine Auswahl aus</p>
          <h2 className="mt-4 font-serif text-7xl font-light italic leading-none md:text-9xl">der Karte</h2>
        </div>
        <p className="max-w-sm text-muted-foreground md:col-span-5 md:justify-self-end">Saisonal, ehrlich und täglich frisch zubereitet.</p>
      </Reveal>
      <div className="no-scrollbar -mx-6 mt-16 flex gap-8 overflow-x-auto border-b border-border px-6 md:mx-0 md:px-0">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`relative shrink-0 pb-5 text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
              cat === c ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
            <span className={`absolute inset-x-0 -bottom-px h-px bg-gold transition-transform duration-700 ${cat === c ? "scale-x-100" : "scale-x-0"}`} />
          </button>
        ))}
      </div>
      <div key={cat} className="grid animate-in fade-in slide-in-from-bottom-2 duration-700 md:grid-cols-2 md:gap-x-20">
        {(MENU[cat] ?? []).map((it) => (
          <div key={it.name} className="group border-b border-border py-8 transition-colors duration-500">
            <div className="flex items-baseline gap-4">
              <h3 className="font-serif text-2xl transition-colors duration-500 group-hover:text-gold md:text-[1.7rem]">{it.name}</h3>
              {it.tag && <span className="border border-olive/40 px-1.5 py-0.5 text-[0.6rem] tracking-widest text-olive">{it.tag}</span>}
              <span className="flex-1 translate-y-[-4px] border-b border-dotted border-border" />
              <span className="text-sm tabular-nums">€{it.price}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">V vegetarisch · VG vegan · Allergene auf Anfrage</p>
        <a href="#menu" className="group inline-flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.25em]">
          <span className="link-line">Full Menu</span>
          <span className="h-px w-10 bg-gold transition-all duration-700 group-hover:w-16" />
        </a>
      </div>
    </section>
  );
}

function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  useEffect(() => {
    const f = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r) setY((r.top + r.height / 2 - window.innerHeight / 2) * -0.08);
    };
    window.addEventListener("scroll", f, { passive: true });
    f();
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <section className="bg-espresso py-28 text-cream md:py-40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <Reveal className="mb-16 grid gap-6 md:grid-cols-12">
          <p className="eyebrow text-gold md:col-span-4">Die Atmosphäre</p>
          <h2 className="font-serif text-5xl font-light leading-[1.02] md:col-span-8 md:text-8xl">
            Langsame Morgen.
            <br />
            <em className="text-gold">Goldene Abende.</em>
          </h2>
        </Reveal>
        <div ref={ref} className="relative h-[60vh] overflow-hidden md:h-[80vh]">
          <img src={atmos} alt="Kerzenbeleuchteter Tisch zur goldenen Stunde" loading="lazy" width={1920} height={1088} className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover" style={{ transform: `translateY(${y}px)` }} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-12 md:gap-8">
          {[
            { src: pastry, alt: "Pistazien-Porridge und Croissant", cls: "md:col-span-4 aspect-square" },
            { src: cafe, alt: "Kaffee und Croissant", cls: "md:col-span-3 md:mt-24 aspect-[4/5]" },
            { src: cocktail, alt: "Cocktail bei Kerzenlicht", cls: "col-span-2 md:col-span-5 aspect-[4/5] md:-mt-32" },
          ].map((im, i) => (
            <Reveal key={i} delay={i * 120} className={`group overflow-hidden ${im.cls}`}>
              <img src={im.src} alt={im.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1800ms] group-hover:scale-105" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Visit() {
  return (
    <section id="visit" className="mx-auto max-w-[1440px] px-6 py-28 md:px-12 md:py-44">
      <div className="grid gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-muted-foreground">Finde uns</p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
            Komm vorbei,
            <br />
            <em>bleib eine Weile.</em>
          </h2>
          <dl className="mt-14 divide-y divide-border border-y border-border">
            {[
              ["Montag — Donnerstag", "07:00 – 23:00"],
              ["Freitag — Samstag", "07:00 – 01:00"],
              ["Sonntag", "08:00 – 22:00"],
            ].map(([d, t]) => (
              <div key={d} className="flex justify-between py-5 text-sm">
                <dt className="text-muted-foreground">{d}</dt>
                <dd className="tabular-nums">{t}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="eyebrow mb-3 text-gold">Adresse</p>
              <p className="leading-relaxed">Berlinerstr 196<br />14547 Beelitz, Germany</p>
            </div>
            <div>
              <p className="eyebrow mb-3 text-gold">Telefon</p>
              <a href="tel:+4933204634887" className="link-line">+49 33204 634887</a>
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
            <a href="#visit" className="absolute bottom-6 right-6 bg-foreground px-7 py-4 text-[0.7rem] uppercase tracking-[0.25em] text-background transition-colors duration-500 hover:bg-gold hover:text-foreground">
              Get Directions →
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

function Reservation() {
  const [sent, setSent] = useState(false);
  return (
    <section id="reserve" className="bg-espresso text-cream">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-6 py-28 md:grid-cols-12 md:px-12 md:py-40">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-gold">Reservierung</p>
          <h2 className="mt-6 font-serif text-6xl font-light leading-none md:text-8xl">
            Tisch <em>reservieren</em>
          </h2>
          <p className="mt-8 max-w-sm leading-relaxed text-cream/70">
            Sag uns, wann du vorbeikommen möchtest. Wir bestätigen innerhalb einer Stunde.
          </p>
          <div className="mt-12 flex items-center gap-3">
            <span className="h-px w-12 bg-gold" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          </div>
        </Reveal>
        <Reveal className="md:col-span-7" delay={150}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="grid gap-x-10 gap-y-10 sm:grid-cols-2"
          >
            <Field label="Your Name"><input className={inputCls} placeholder="Vor- und Nachname" /></Field>
            <Field label="Phone"><input type="tel" className={inputCls} placeholder="+49" /></Field>
            <Field label="Date"><input type="date" className={inputCls} /></Field>
            <Field label="Time">
              <select className={inputCls} defaultValue="19:00">
                {["08:00", "10:00", "12:00", "14:00", "17:00", "19:00", "20:30", "22:00"].map((t) => (
                  <option key={t} className="bg-espresso">{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Guests" className="sm:col-span-2">
              <div className="mt-4 flex flex-wrap gap-2">
                {["1", "2", "3", "4", "5", "6", "7+"].map((g) => (
                  <label key={g} className="cursor-pointer">
                    <input type="radio" name="guests" defaultChecked={g === "2"} className="peer sr-only" />
                    <span className="grid h-11 w-11 place-items-center border border-cream/25 text-sm transition-colors duration-500 hover:border-gold peer-checked:border-gold peer-checked:bg-gold peer-checked:text-espresso">
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Special Requests" className="sm:col-span-2">
              <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Anlass, Allergien, Lieblingsplatz am Fenster…" />
            </Field>
            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button className="bg-gold px-10 py-5 text-[0.72rem] uppercase tracking-[0.28em] text-espresso transition-colors duration-500 hover:bg-cream">
                Anfrage senden
              </button>
              {sent && <p className="font-serif text-xl italic text-gold">Danke — wir melden uns in Kürze.</p>}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-espresso text-cream/70">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-20 md:grid-cols-12 md:px-12">
        <div className="md:col-span-4">
          <p className="font-serif text-4xl tracking-[0.3em] text-cream">AURÉA</p>
          <p className="mt-4 font-serif text-xl italic">A golden retreat from dawn to late.</p>
        </div>
        <nav className="flex flex-col gap-3 text-sm md:col-span-2">
          {[["Home", "#top"], ["Menu", "#menu"], ["Story", "#story"], ["Visit", "#visit"], ["Reservation", "#reserve"]].map(([l, h]) => (
            <a key={l} href={h} className="link-line w-fit hover:text-cream">{l}</a>
          ))}
        </nav>
        <div className="text-sm leading-relaxed md:col-span-3">
          <p className="eyebrow mb-4 text-gold">Kontakt</p>
          Berlinerstr 196<br />14547 Beelitz<br />+49 33204 634887
        </div>
        <div className="text-sm leading-relaxed md:col-span-3">
          <p className="eyebrow mb-4 text-gold">Öffnungszeiten</p>
          Mo–Do 07–23<br />Fr–Sa 07–01<br />So 08–22
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 border-t border-cream/10 px-6 py-8 text-xs sm:flex-row md:px-12">
        <p>© 2026 Auréa Café & Lounge. Alle Rechte vorbehalten.</p>
        <div className="flex gap-6 uppercase tracking-[0.2em]">
          {["Instagram", "Facebook", "TikTok"].map((s) => (
            <a key={s} href="#top" className="link-line hover:text-gold">{s}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Index() {
  useReveal();
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <Intro />
      <Chapters />
      <Story />
      <Menu />
      <Atmosphere />
      <Visit />
      <Reservation />
      <Footer />
    </main>
  );
}
