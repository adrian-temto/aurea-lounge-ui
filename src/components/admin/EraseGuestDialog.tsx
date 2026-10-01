"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, ShieldX } from "lucide-react";
import { toast } from "sonner";

import { eraseGuestData } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EraseTarget = { email: string; phone: string; name?: string };

/**
 * Right to erasure: deletes every reservation of one guest, matched by email address or phone
 * number. Opened from a reservation (prefilled) or empty, for a request that came in by email.
 */
export function EraseGuestDialog({
  target,
  onOpenChange,
  onErased,
}: {
  target: EraseTarget | null;
  onOpenChange: (open: boolean) => void;
  onErased: () => void;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-lg">
        {target && (
          <EraseForm
            key={`${target.email}|${target.phone}`}
            target={target}
            onClose={() => onOpenChange(false)}
            onErased={onErased}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EraseForm({
  target,
  onClose,
  onErased,
}: {
  target: EraseTarget;
  onClose: () => void;
  onErased: () => void;
}) {
  const [email, setEmail] = useState(target.email);
  const [phone, setPhone] = useState(target.phone);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await eraseGuestData(email, phone);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const n = res.deleted ?? 0;
      if (n === 0) toast.info("Keine Reservierungen mit diesen Angaben gefunden.");
      else toast.success(`${n} ${n === 1 ? "Reservierung" : "Reservierungen"} endgültig gelöscht`);
      onErased();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldX className="size-5 text-destructive" aria-hidden />
          Gastdaten löschen
        </DialogTitle>
        <DialogDescription>
          {target.name
            ? `Alle Reservierungen von ${target.name}`
            : "Alle Reservierungen eines Gastes"}{" "}
          mit dieser E-Mail-Adresse <em>oder</em> Telefonnummer werden endgültig gelöscht — auch
          ältere und künftige. Das lässt sich nicht rückgängig machen.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="erase-email">E-Mail-Adresse</Label>
        <Input
          id="erase-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="erase-phone">Telefonnummer</Label>
        <Input
          id="erase-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Schreibweisen wie +49 …, 0049 … und 0 … gelten als dieselbe Nummer.
        </p>
      </div>
      <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Bereits verschickte E-Mails liegen zusätzlich in eurem Postfach und im Versandprotokoll von
        Resend — dort bitte ebenfalls löschen. Bestätige dem Gast die Löschung anschließend.
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          <span>Endgültig löschen</span>
        </Button>
      </DialogFooter>
    </form>
  );
}
