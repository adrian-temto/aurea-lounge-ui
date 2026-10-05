"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Armchair,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Phone,
  Users,
  X,
} from "lucide-react";
import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

import { createReservation } from "@/app/actions/reservations";
import { PRIVACY_PATH } from "@/components/consent/ConsentProvider";
import { useI18n } from "@/i18n/client";
import { EuDateInput } from "./EuDateInput";
import { TimeSelect } from "./TimeSelect";
import {
  CONTACT,
  MAX_ONLINE_GUESTS,
  SEATING,
  TIME_SLOTS,
  nowInBerlin,
  todayInBerlin,
  type Seating,
} from "@/lib/reservation";

/** Name, phone and email, kept on this device only when the guest ticks "remember". */
export const SAVED_CONTACT_KEY = "aurea_guest_contact";
const CONTACT_FIELDS = ["name", "phone", "email"] as const;

/**
 * Fills a booking form with the details saved on this device, and returns the submit handler
 * that saves them again (or forgets them when "remember" is unticked).
 */
export function useSavedContact(form: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const f = form.current;
    if (!f) return;
    let saved: Partial<Record<(typeof CONTACT_FIELDS)[number], string>> | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(SAVED_CONTACT_KEY) ?? "null");
    } catch {
      return;
    }
    if (!saved) return;
    for (const key of CONTACT_FIELDS) {
      const el = f.elements.namedItem(key) as HTMLInputElement | null;
      if (el && !el.value && typeof saved[key] === "string") el.value = saved[key];
    }
    const remember = f.elements.namedItem("remember") as HTMLInputElement | null;
    if (remember) remember.checked = true;
  }, [form]);

  return useCallback(() => {
    const f = form.current;
    if (!f) return;
    const data = new FormData(f);
    try {
      if (data.get("remember") === "on") {
        const entry = Object.fromEntries(CONTACT_FIELDS.map((k) => [k, String(data.get(k) ?? "")]));
        localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify(entry));
      } else {
        localStorage.removeItem(SAVED_CONTACT_KEY);
      }
    } catch {
      // Blocked storage: the booking still goes through, it just isn't remembered.
    }
  }, [form]);
}

type Ctx = { open: (returnFocus?: HTMLElement | null) => void };
const ReservationContext = createContext<Ctx | null>(null);

export function ReservationModalProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // Each opening starts a fresh form.
  const [session, setSession] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback((target: HTMLElement | null = null) => {
    returnFocus.current = target;
    setSession((n) => n + 1);
    setOpen(true);
  }, []);

  return (
    <ReservationContext.Provider value={{ open: show }}>
      {children}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-espresso/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200" />
          <DialogPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => {
              // Back to the button that opened it, unless it has gone (e.g. the closed mobile menu).
              e.preventDefault();
              const target = returnFocus.current;
              if (
                target?.isConnected &&
                (target.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ??
                  true)
              ) {
                target.focus();
              }
            }}
            className="fixed left-1/2 top-1/2 z-[60] max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-[27rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-gold/30 bg-background px-5 pb-6 pt-7 text-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-3 data-[state=open]:zoom-in-[0.98] data-[state=open]:duration-300 data-[state=open]:ease-aurea data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:duration-200 data-[state=closed]:ease-aurea-in sm:px-8 sm:pb-8 sm:pt-8"
          >
            <DialogPrimitive.Close
              aria-label={t.reservation.close}
              className={`absolute right-3 top-3 grid size-10 place-items-center text-muted-foreground transition-colors hover:text-foreground ${focusRing}`}
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
            <QuickReservation key={session} onDone={() => setOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ReservationContext.Provider>
  );
}

/**
 * A normal #reserve link that opens the modal instead. Without JavaScript it still jumps to the
 * reservation section. `returnFocus` names where focus goes after closing if not the link itself.
 */
export function ReserveLink({
  onClick,
  returnFocus,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { returnFocus?: RefObject<HTMLElement | null> }) {
  const ctx = useContext(ReservationContext);
  return (
    <a
      href="#reserve"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!ctx) return;
        e.preventDefault();
        ctx.open(returnFocus?.current ?? e.currentTarget);
      }}
    />
  );
}

const focusRing =
  "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
const input = `h-12 w-full appearance-none border border-border bg-card px-3 text-base text-foreground [color-scheme:light] transition-[border-color,background-color] duration-200 ease-aurea hover:border-foreground/40 focus:border-gold focus:bg-background sm:text-sm ${focusRing}`;
// Leaves room for the icon on the left and the chevron on the right.
const control = `${input} pl-10 pr-9`;
const primary = `press w-full bg-gold px-6 py-4 text-[0.72rem] uppercase tracking-[0.28em] text-espresso hover:bg-espresso hover:text-cream disabled:opacity-60 ${focusRing}`;

type Details = { guests: string; date: string; time: string; seating: Seating };

function QuickReservation({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [today] = useState(todayInBerlin);
  const [now] = useState(nowInBerlin);
  const slotsFor = (date: string) =>
    date === today ? TIME_SLOTS.filter((slot) => slot > now) : TIME_SLOTS;
  const [details, setDetails] = useState<Details>(() => {
    const d = slotsFor(today).length ? today : nextDay(today);
    const slots = slotsFor(d);
    return {
      guests: "2",
      date: d,
      time: slots.includes("19:00") ? "19:00" : (slots[0] ?? ""),
      seating: "any",
    };
  });
  const [step, setStep] = useState<"details" | "contact">("details");
  const [cameBack, setCameBack] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timeLabel = useId();

  // Start keyboard and screen reader users at the heading of each step, not inside a field.
  useEffect(() => titleRef.current?.focus(), [step]);

  const slots = slotsFor(details.date);
  const time = slots.includes(details.time) ? details.time : (slots[0] ?? "");
  const set = (patch: Partial<Details>) => setDetails((d) => ({ ...d, ...patch }));

  if (step === "contact") {
    return (
      <ContactStep
        details={{ ...details, time }}
        titleRef={titleRef}
        onBack={() => {
          setCameBack(true);
          setStep("details");
        }}
        onDone={onDone}
      />
    );
  }

  return (
    <form
      className={cameBack ? stepIn("left") : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (time) setStep("contact");
      }}
    >
      <Brand />
      <DialogPrimitive.Title
        ref={titleRef}
        tabIndex={-1}
        className="mt-5 text-center font-serif text-[2.1rem] font-light leading-none outline-none"
      >
        {t.reservation.modalTitle} <em>{t.reservation.modalTitleEm}</em>
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className="mt-3 text-center text-sm text-muted-foreground">
        {t.reservation.modalDescription}
      </DialogPrimitive.Description>

      <div className="mt-7 grid gap-x-3 gap-y-4 min-[440px]:grid-cols-2">
        <Field label={t.reservation.guests} icon={Users}>
          <select
            value={details.guests}
            onChange={(e) => set({ guests: e.target.value })}
            className={control}
          >
            {Array.from({ length: MAX_ONLINE_GUESTS }, (_, i) => i + 1).map((g) => (
              <option key={g} value={String(g)}>
                {t.reservation.persons(g)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.reservation.date} icon={CalendarDays}>
          <EuDateInput
            required
            min={today}
            value={details.date}
            onChange={(date) => set({ date })}
            className={`${input} pl-10`}
          />
        </Field>
        <Field label={t.reservation.seating} icon={Armchair}>
          <select
            value={details.seating}
            onChange={(e) => set({ seating: e.target.value as Seating })}
            className={control}
          >
            {SEATING.map((s) => (
              <option key={s.value} value={s.value}>
                {t.reservation.seatingOptions[s.value] ?? s.label}
              </option>
            ))}
          </select>
        </Field>
        {/* A group, not a label: it names two selects, hour and minute. */}
        <div role="group" aria-labelledby={timeLabel} className="group block min-w-0">
          <span
            id={timeLabel}
            className="eyebrow text-muted-foreground transition-colors duration-200 group-focus-within:text-foreground"
          >
            {t.reservation.time}
          </span>
          <span className="relative mt-2 flex items-center">
            <Clock className="pointer-events-none absolute left-3 z-10 size-4 text-gold" aria-hidden />
            <TimeSelect
              slots={slots}
              value={time}
              onChange={(time) => set({ time })}
              required
              chevrons
              hourClassName={`${input} pl-10 pr-8`}
              minuteClassName={`${input} pl-3 pr-8`}
            />
          </span>
        </div>
      </div>

      {!slots.length && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {t.reservation.noSlotsToday}
        </p>
      )}

      <button type="submit" disabled={!time} className={`${primary} mt-6`}>
        {t.reservation.continue}
      </button>
      <GroupHint className="mt-4 text-center" />
    </form>
  );
}

function ContactStep({
  details,
  titleRef,
  onBack,
  onDone,
}: {
  details: Details;
  titleRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onDone: () => void;
}) {
  const { locale, t } = useI18n();
  const [state, formAction, pending] = useActionState(createReservation, null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saveContact = useSavedContact(formRef);

  useEffect(() => {
    if (state?.ok) titleRef.current?.focus();
    else if (state) errorRef.current?.focus();
  }, [state, titleRef]);

  if (state?.ok) {
    return (
      <div className="animate-in fade-in text-center duration-500 ease-aurea">
        <SentMark />
        <DialogPrimitive.Title
          ref={titleRef}
          tabIndex={-1}
          className="mt-5 font-serif text-[2.1rem] font-light leading-none outline-none"
        >
          {t.reservation.sentTitle} <em>{t.reservation.sentTitleEm}</em>
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="mt-3 text-sm text-muted-foreground">
          {state.message}
        </DialogPrimitive.Description>
        <Summary details={details} className="mt-6 justify-center" />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {t.reservation.sentNote}
        </p>
        <button type="button" onClick={onDone} className={`${primary} mt-6`}>
          {t.reservation.close}
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={saveContact} className={stepIn("right")}>
      <button
        type="button"
        onClick={onBack}
        className={`-ml-1 inline-flex items-center gap-2 px-1 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground ${focusRing}`}
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.reservation.back}
      </button>
      <DialogPrimitive.Title
        ref={titleRef}
        tabIndex={-1}
        className="mt-4 font-serif text-[2.1rem] font-light leading-none outline-none"
      >
        {t.reservation.contactTitle} <em>{t.reservation.contactTitleEm}</em>
      </DialogPrimitive.Title>
      <Summary details={details} className="mt-5" />

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="guests" value={details.guests} />
      <input type="hidden" name="date" value={details.date} />
      <input type="hidden" name="time" value={details.time} />
      <input type="hidden" name="seating" value={details.seating} />

      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="eyebrow text-muted-foreground">{t.reservation.name}</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder={t.reservation.namePlaceholder}
            className={`${input} mt-2`}
          />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground">{t.reservation.phone}</span>
          <input
            name="phone"
            type="tel"
            required
            minLength={5}
            maxLength={30}
            autoComplete="tel"
            placeholder="+49"
            className={`${input} mt-2`}
          />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground">{t.reservation.email}</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder={t.reservation.emailPlaceholder}
            className={`${input} mt-2`}
          />
        </label>
      </div>

      <ReservationConsents className="mt-5" />

      {state && !state.ok && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 animate-in border-l-2 border-destructive pl-3 text-sm text-destructive outline-none fade-in slide-in-from-top-1 duration-300 ease-aurea"
        >
          {state.message}
        </p>
      )}

      <ReservationPrivacyNote className="mt-6 border-t border-border pt-4" />

      <button type="submit" disabled={pending} className={`${primary} mt-5`}>
        {pending ? t.reservation.sending : t.reservation.submit}
      </button>
    </form>
  );
}

/**
 * The booking form's optional checkboxes. "remember" stays on this device (see useSavedContact);
 * the offers opt-in is stored with the request and only counts once confirmed by email.
 */
export function ReservationConsents({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { t } = useI18n();
  const boxes = [
    { name: "remember", label: t.reservation.remember },
    { name: "marketing_email", label: t.reservation.marketingEmail },
  ];
  return (
    <div className={`grid gap-3 ${className}`}>
      {boxes.map((b) => (
        <label
          key={b.name}
          className={`flex cursor-pointer items-start gap-3 text-sm leading-snug ${dark ? "text-cream/80" : "text-foreground"}`}
        >
          <input type="checkbox" name={b.name} className="peer sr-only" />
          <span
            aria-hidden
            className={`mt-px grid size-[1.125rem] shrink-0 place-items-center border transition-colors duration-200 peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100 ${dark ? "border-cream/40 text-espresso" : "border-foreground/30 text-espresso"}`}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
          <span>{b.label}</span>
        </label>
      ))}
    </div>
  );
}

/** What happens with the booking details. Keep it in step with /datenschutz. */
export function ReservationPrivacyNote({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { t, href } = useI18n();
  return (
    <p
      className={`text-xs leading-relaxed ${dark ? "text-cream/60" : "text-muted-foreground"} ${className}`}
    >
      {t.reservation.privacy}{" "}
      {/* A new tab, so reading it doesn't throw away what was typed. */}
      <a
        href={href(PRIVACY_PATH)}
        target="_blank"
        rel="noopener"
        className={`underline underline-offset-4 ${dark ? "text-cream hover:text-gold" : "text-foreground hover:text-gold"} ${focusRing}`}
      >
        {t.reservation.privacyLink}
        <span className="sr-only"> {t.reservation.newTab}</span>
      </a>
      .
    </p>
  );
}

/** Online booking stops at MAX_ONLINE_GUESTS; bigger groups call. */
export function GroupHint({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { t } = useI18n();
  return (
    <p className={`text-xs ${dark ? "text-cream/60" : "text-muted-foreground"} ${className}`}>
      {t.reservation.groupHint(MAX_ONLINE_GUESTS)}{" "}
      <a
        href={CONTACT.phoneHref}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap underline underline-offset-4 ${dark ? "text-cream hover:text-gold" : "text-foreground hover:text-gold"} ${focusRing}`}
      >
        <Phone className="size-3.5" aria-hidden />
        {CONTACT.phone}
      </a>
    </p>
  );
}

const stepIn = (from: "left" | "right") =>
  `animate-in fade-in duration-300 ease-aurea ${from === "right" ? "slide-in-from-right-3" : "slide-in-from-left-3"}`;

function SentMark() {
  return (
    <svg viewBox="0 0 48 48" className="mx-auto size-12 text-gold" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1" className="opacity-40" />
      <path
        d="M15 24.5l6 6 12-13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw"
        style={{ "--len": 30 } as CSSProperties}
      />
    </svg>
  );
}

function Brand() {
  return (
    <img src="/logo.svg" alt="Auréa" width={645} height={167} className="mx-auto h-9 w-auto" />
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Users;
  children: ReactNode;
}) {
  return (
    <label className="group block min-w-0">
      <span className="eyebrow text-muted-foreground transition-colors duration-200 group-focus-within:text-foreground">
        {label}
      </span>
      <span className="relative mt-2 flex items-center">
        <Icon className="pointer-events-none absolute left-3 z-10 size-4 text-gold" aria-hidden />
        {children}
        <ChevronDown
          className="pointer-events-none absolute right-3 size-4 text-muted-foreground [input~&]:hidden"
          aria-hidden
        />
      </span>
    </label>
  );
}

function Summary({ details, className = "" }: { details: Details; className?: string }) {
  const { t } = useI18n();
  const parts = [
    t.reservation.persons(Number(details.guests)),
    new Date(`${details.date}T12:00:00`).toLocaleDateString(t.intl, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    t.reservation.atTime(details.time),
    details.seating !== "any" ? t.reservation.seatingOptions[details.seating] : null,
  ].filter(Boolean);
  return (
    <p className={`flex flex-wrap gap-x-2 gap-y-1 text-sm ${className}`}>
      {parts.map((p, i) => (
        <span key={i} className="whitespace-nowrap">
          {i > 0 && (
            <span className="mr-2 text-gold" aria-hidden>
              ·
            </span>
          )}
          {p}
        </span>
      ))}
    </p>
  );
}

function nextDay(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
