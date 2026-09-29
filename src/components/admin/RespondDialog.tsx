"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Copy, Loader2, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import { toast } from "sonner";

import { respondToReservation } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/lib/types";

import { guests, longDate, time } from "./format";

const OPTIONS: { status: ReservationStatus; label: string; hint: string }[] = [
  { status: "confirmed", label: "Bestätigen", hint: "Tisch ist reserviert" },
  { status: "declined", label: "Ablehnen", hint: "Ausgebucht o. Ä." },
  { status: "new", label: "Rückfrage", hint: "Bleibt offen" },
  { status: "cancelled", label: "Stornieren", hint: "Termin entfällt" },
];

function template(r: Reservation, status: ReservationStatus) {
  const first = r.name.trim().split(/\s+/)[0] ?? r.name;
  const when = `${longDate(r.reservation_date)} um ${time(r)} Uhr`;
  const party = `${r.guests} ${r.guests === 1 ? "Person" : "Personen"}`;
  const sign = "\n\nHerzliche Grüße\nDein Auréa-Team";
  switch (status) {
    case "confirmed":
      return `Hallo ${first},\n\nvielen Dank für deine Reservierung! Dein Tisch für ${party} am ${when} ist bestätigt. Wir freuen uns auf dich.${sign}`;
    case "declined":
      return `Hallo ${first},\n\nvielen Dank für deine Anfrage. Leider sind wir am ${when} bereits ausgebucht. Gerne finden wir eine andere Zeit für dich — ruf uns einfach an: +49 33204 634887.${sign}`;
    case "cancelled":
      return `Hallo ${first},\n\ndeine Reservierung für ${party} am ${when} ist storniert. Wir hoffen, dich bald wieder bei uns zu sehen.${sign}`;
    default:
      return `Hallo ${first},\n\nvielen Dank für deine Anfrage für ${party} am ${when}. Eine kurze Rückfrage: ${sign}`;
  }
}

/** Digits in international format for wa.me / sms: links. Numbers without a country code are treated as German. */
function intlPhone(phone: string) {
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
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function choose(s: ReservationStatus) {
    setStatus(s);
    if (!edited) setMessage(template(r, s));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await respondToReservation(r.id, status, message);
      if (res.error || !res.reservation) {
        toast.error(res.error ?? "Speichern fehlgeschlagen.");
        return;
      }
      onSaved(res.reservation);
      setSaved(true);
      toast.success("Antwort gespeichert");
    });
  }

  const phone = intlPhone(r.phone);
  const text = encodeURIComponent(message.trim());

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold tracking-tight">Antwort an {r.name}</DialogTitle>
        <DialogDescription>
          {longDate(r.reservation_date)} · {time(r)} Uhr · {guests(r.guests)} · {r.phone}
        </DialogDescription>
      </DialogHeader>
      {r.special_requests && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm italic text-muted-foreground">
          „{r.special_requests}“
        </p>
      )}

      {!saved ? (
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              {pending ? "Speichert…" : "Antwort speichern"}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <div className="grid gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {r.user_id
              ? "Gespeichert — der Gast sieht die Antwort in seinem Auréa-Konto. Du kannst sie zusätzlich direkt schicken:"
              : "Gespeichert. Der Gast hat kein Konto — schick ihm die Antwort direkt:"}
          </p>
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
