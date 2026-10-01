"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Mail, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { createAdmin, removeAdmin, resendLogin } from "@/app/admin/team/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NO_SECRET_KEY, ROLE_LABEL } from "@/lib/team";
import type { Role } from "@/lib/types";

import { PageHeader } from "./PageHeader";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
  waitingForFirstLogin: boolean;
};

export default function TeamView({
  meId,
  members,
  hasSecretKey,
}: {
  meId: string;
  members: Member[];
  hasSecretKey: boolean;
}) {
  const [removing, setRemoving] = useState<Member | null>(null);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Team" description="Hier entscheidest du, wer Zugang zum Dashboard hat." />

      {!hasSecretKey && (
        <div
          role="alert"
          className="mb-8 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <p>{NO_SECRET_KEY}</p>
        </div>
      )}

      <AddAdmin disabled={!hasSecretKey} />

      <section aria-labelledby="members-title" className="mt-10">
        <h2 id="members-title" className="text-lg font-semibold">
          Zugang haben
        </h2>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {hasSecretKey
              ? "Noch niemand."
              : "Die Liste erscheint, sobald der Secret Key gesetzt ist."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card/40">
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isMe={m.id === meId}
                onRemove={() => setRemoving(m)}
              />
            ))}
          </ul>
        )}
      </section>

      <RemoveDialog member={removing} onClose={() => setRemoving(null)} />
    </div>
  );
}

/** Name and email; the new admin gets their login details by email. */
function AddAdmin({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    setError(null);
    startTransition(async () => {
      const res = await createAdmin({ name: String(fd.get("name") ?? ""), email });
      if (res.error) return setError(res.error);
      toast.success("Admin angelegt", {
        description: `Die Zugangsdaten sind an ${email} unterwegs.`,
      });
      form.reset();
      router.refresh();
    });
  }

  return (
    <section
      aria-labelledby="add-title"
      className="rounded-lg border border-border bg-card/40 p-5 md:p-6"
    >
      <h2 id="add-title" className="text-lg font-semibold">
        Neuen Admin anlegen
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Die Person bekommt eine E-Mail mit einem vorläufigen Passwort und einem Anmelde-Button. Nach
        der ersten Anmeldung legt sie ihr eigenes Passwort fest.
      </p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="admin-email">E-Mail</Label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            required
            disabled={disabled}
            className="h-11 text-base"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="admin-name">
            Name <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="admin-name"
            name="name"
            maxLength={80}
            autoComplete="off"
            disabled={disabled}
            className="h-11 text-base"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive sm:col-span-2">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={disabled || pending}
          className="h-11 sm:col-span-2 sm:w-fit"
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <UserPlus aria-hidden />}
          <span>Konto anlegen und E-Mail senden</span>
        </Button>
      </form>
    </section>
  );
}

function MemberRow({
  member: m,
  isMe,
  onRemove,
}: {
  member: Member;
  isMe: boolean;
  onRemove: () => void;
}) {
  const [resending, startResend] = useTransition();
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 md:px-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold uppercase">
        {m.name.slice(0, 2)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {m.name}
            {isMe && <span className="text-muted-foreground"> (du)</span>}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              m.role === "owner" ? "bg-gold/20 text-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {m.role === "owner" && <ShieldCheck className="size-3" aria-hidden />}
            {ROLE_LABEL[m.role]}
          </span>
          {m.waitingForFirstLogin && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              Noch nicht angemeldet
            </span>
          )}
        </span>
        <span className="block truncate text-sm text-muted-foreground">{m.email}</span>
      </span>
      {m.role === "admin" && (
        <span className="grid w-full gap-2 sm:flex sm:w-auto">
          {m.waitingForFirstLogin && (
            <Button
              variant="outline"
              className="h-11"
              disabled={resending}
              onClick={() =>
                startResend(async () => {
                  const res = await resendLogin(m.id);
                  if (res.error) return void toast.error(res.error);
                  toast.success("Neue Zugangsdaten gesendet", {
                    description: `An ${m.email}. Das vorherige Passwort gilt nicht mehr.`,
                  });
                })
              }
            >
              {resending ? <Loader2 className="animate-spin" aria-hidden /> : <Mail aria-hidden />}
              <span>Zugangsdaten erneut senden</span>
            </Button>
          )}
          <Button variant="outline" className="h-11" onClick={onRemove}>
            <UserMinus aria-hidden /> Zugang entfernen
          </Button>
        </span>
      )}
    </li>
  );
}

function RemoveDialog({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog open={member !== null} onOpenChange={(o) => !o && !pending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zugang von {member?.name} entfernen?</AlertDialogTitle>
          <AlertDialogDescription>
            {member?.email} kann sich danach nicht mehr anmelden; das Konto wird gelöscht. Antworten
            auf Reservierungen bleiben erhalten. Du kannst die Person später neu anlegen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11" disabled={pending}>
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              if (!member) return;
              startTransition(async () => {
                const res = await removeAdmin(member.id);
                if (res.error) return void toast.error(res.error);
                toast.success(`${member.name} hat keinen Zugang mehr`);
                onClose();
                router.refresh();
              });
            }}
          >
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            <span>Zugang entfernen</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
