"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Copy, Loader2, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import { toast } from "sonner";

import { respondToReservation, type Delivery } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT } from "@/lib/reservation";
import { cn } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/lib/types";

import { guests, longDate, time } from "./format";

const OPTIONS: { status: ReservationStatus; label: string; hint: string }[] = [
  { status: "confirmed", label: "Bestätigen", hint: "Tisch ist reserviert" },
  { status: "declined", label: "Ablehnen", hint: "Ausgebucht o. Ä." },
  { status: "new", label: "Rückfrage", hint: "Bleibt offen" },
  { status: "cancelled", label: "Stornieren", hint: "Termin entfällt" },
];

/** Starting text for the answer, in the language the guest booked in. */
function template(r: Reservation, status: ReservationStatus) {
  return r.locale === "en" ? templateEn(r, status) : templateDe(r, status);
}

function templateDe(r: Reservation, status: ReservationStatus) {
  const first = r.name.trim().split(/\s+/)[0] ?? r.name;
  const when = `${longDate(r.reservation_date)} um ${time(r)} Uhr`;
  const party = `${r.guests} ${r.guests === 1 ? "Person" : "Personen"}`;
  const sign = "\n\nHerzliche Grüße\nDein Auréa-Team";
  switch (status) {
    case "confirmed":
      return `Hallo ${first},\n\nvielen Dank für deine Reservierung! Dein Tisch für ${party} am ${when} ist bestätigt. Wir freuen uns auf dich.${sign}`;
    case "declined":
      return `Hallo ${first},\n\nvielen Dank für deine Anfrage. Leider sind wir am ${when} bereits ausgebucht. Gerne finden wir eine andere Zeit für dich — ruf uns einfach an: ${CONTACT.phone}.${sign}`;
    case "cancelled":
      return `Hallo ${first},\n\ndeine Reservierung für ${party} am ${when} ist storniert. Wir hoffen, dich bald wieder bei uns zu sehen.${sign}`;
    default:
      return `Hallo ${first},\n\nvielen Dank für deine Anfrage für ${party} am ${when}. Eine kurze Rückfrage: ${sign}`;
  }
}

function templateEn(r: Reservation, status: ReservationStatus) {
  const first = r.name.trim().split(/\s+/)[0] ?? r.name;
  const date = new Date(`${r.reservation_date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const when = `${date} at ${time(r)}`;
  const party = `${r.guests} ${r.guests === 1 ? "person" : "people"}`;
  const sign = "\n\nWarm regards\nThe Auréa team";
  switch (status) {
    case "confirmed":
      return `Hello ${first},\n\nthank you for your reservation! Your table for ${party} on ${when} is confirmed. We look forward to welcoming you.${sign}`;
    case "declined":
      return `Hello ${first},\n\nthank you for your request. Unfortunately we are fully booked on ${when}. We would be happy to find another time for you — just give us a call: ${CONTACT.phone}.${sign}`;
    case "cancelled":
      return `Hello ${first},\n\nyour reservation for ${party} on ${when} has been cancelled. We hope to see you again soon.${sign}`;
    default:
      return `Hello ${first},\n\nthank you for your request for ${party} on ${when}. A quick question: ${sign}`;
  }
}

/** Digits in international format for wa.me / sms: links. Numbers without a country code are treated as German. */
function intlPhone(phone: string | null) {
  if (!phone) return "";
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `49${digits.slice(1)}`;
  return digits;
}

type Props = {
  reservation: Reservation | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (r: Reservation) => void;
};

export function RespondDialog({ reservation, onOpenChange, onSaved }: Props) {
  return (
    <Dialog open={reservation !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        {/* Keyed so each reservation starts with a fresh draft. */}
        {reservation && (
          <RespondForm
            key={reservation.id}
            r={reservation}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RespondForm({
  r,
  onClose,
  onSaved,
}: {
  r: Reservation;
  onClose: () => void;
  onSaved: (r: Reservation) => void;
}) {
  const initialStatus: ReservationStatus = r.status === "new" ? "confirmed" : r.status;
  const [status, setStatus] = useState<ReservationStatus>(initialStatus);
  const [message, setMessage] = useState(r.admin_response ?? template(r, initialStatus));
  const [edited, setEdited] = useState(Boolean(r.admin_response));
  const [notify, setNotify] = useState(Boolean(r.email));
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(s: ReservationStatus) {
    setStatus(s);
    if (!edited) setMessage(template(r, s));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await respondToReservation(r.id, status, message, notify);
      if (res.error || !res.reservation || !res.delivery) {
        toast.error(res.error ?? "Speichern fehlgeschlagen.");
        return;
      }
      onSaved(res.reservation);
      setDelivery(res.delivery);
      if (res.delivery.emailed) toast.success(`Antwort per E-Mail an ${r.email} gesendet`);
      else toast.success("Antwort gespeichert");
    });
  }

  const phone = intlPhone(r.phone);
  const text = encodeURIComponent(message.trim());

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold tracking-tight">Antwort an {r.name}</DialogTitle>
        <DialogDescription>
          {longDate(r.reservation_date)} · {time(r)} Uhr · {guests(r.guests)}
          {r.phone && ` · ${r.phone}`}
          {r.locale === "en" && " · bucht auf Englisch"}
        </DialogDescription>
      </DialogHeader>
      {r.special_requests && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm italic text-muted-foreground">
          „{r.special_requests}“
        </p>
      )}

      {!delivery ? (
        <form onSubmit={submit} className="grid gap-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Status</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {OPTIONS.map((o) => (
                <label key={o.status} className="cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={o.status}
                    checked={status === o.status}
                    onChange={() => choose(o.status)}
                    className="peer sr-only"
                  />
                  <span className="flex h-full flex-col rounded-md border border-border px-3 py-2 transition-colors duration-200 hover:border-foreground/40 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                    <span className="text-sm font-medium">{o.label}</span>
                    <span className="text-xs opacity-70">{o.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="respond-message">Nachricht an den Gast</Label>
            <Textarea
              id="respond-message"
              rows={9}
              maxLength={2000}
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setEdited(true);
              }}
              className="resize-y leading-relaxed"
            />
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              {edited ? (
                <button
                  type="button"
                  onClick={() => {
                    setMessage(template(r, status));
                    setEdited(false);
                  }}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Vorlage wiederherstellen
                </button>
              ) : (
                <span>Die Vorlage passt sich dem Status an.</span>
              )}
              <span className="tabular-nums">{message.length}/2000</span>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-border px-3 py-3 text-sm has-[:disabled]:opacity-60">
            <Checkbox
              checked={notify}
              disabled={!r.email}
              onCheckedChange={(v) => setNotify(v === true)}
              className="mt-0.5"
            />
            <span>
              {r.email ? (
                <>
                  Per E-Mail an <span className="font-medium">{r.email}</span> senden
                  {r.response_emailed_at && (
                    <span className="block text-xs text-muted-foreground">
                      Eine frühere Antwort wurde schon per E-Mail geschickt.
                    </span>
                  )}
                </>
              ) : (
                "Keine E-Mail-Adresse hinterlegt — nur speichern."
              )}
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {pending ? "Sendet…" : notify ? "Speichern & senden" : "Antwort speichern"}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="grid gap-5">
          {delivery.emailed ? (
            <p className="flex items-start gap-2 rounded-md bg-olive/10 px-3 py-3 text-sm leading-relaxed">
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-olive" aria-hidden />
              <span>
                Gespeichert und per E-Mail an <span className="font-medium">{r.email}</span> gesendet.
                Antworten des Gastes landen in eurem Postfach.
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-3 text-sm leading-relaxed">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
              <span>
                Gespeichert, aber nicht per E-Mail verschickt: {delivery.reason} Schick die Antwort
                bei Bedarf direkt:
              </span>
            </p>
          )}
          {!delivery.emailed && phone && (
          <div className="grid grid-cols-2 gap-2">
            <SendLink href={`https://wa.me/${phone}?text=${text}`} external Icon={MessageCircle}>
              WhatsApp
            </SendLink>
            <SendLink href={`sms:+${phone}?&body=${text}`} Icon={MessageSquareText}>
              SMS
            </SendLink>
            <SendLink href={`tel:+${phone}`} Icon={Phone}>
              Anrufen
            </SendLink>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                navigator.clipboard.writeText(message.trim()).then(
                  () => toast.success("Text kopiert"),
                  () => toast.error("Kopieren nicht möglich"),
                )
              }
            >
              <Copy aria-hidden /> Text kopieren
            </Button>
          </div>
          )}
          <DialogFooter>
            <Button onClick={onClose}>Fertig</Button>
          </DialogFooter>
        </div>
      )}
    </>
  );
}

function SendLink({
  href,
  external,
  Icon,
  children,
}: {
  href: string;
  external?: boolean;
  Icon: typeof Phone;
  children: string;
}) {
  return (
    <Button asChild variant="outline" className={cn("h-11")}>
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        <Icon aria-hidden /> {children}
      </a>
    </Button>
  );
}
