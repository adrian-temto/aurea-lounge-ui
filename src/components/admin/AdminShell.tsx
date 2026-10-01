"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  ChevronsUpDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { signOut } from "@/app/admin/auth-actions";
import { SITE_URL } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import type { Permission, Reservation } from "@/lib/types";

import { guests, shortDate, time } from "./format";

type Props = {
  children: ReactNode;
  name: string;
  email: string;
  roleLabel: string;
  permissions: Permission[];
  newCount: number;
  defaultOpen: boolean;
};

const NAV: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  permission?: Permission;
}[] = [
  { href: "/admin", label: "Übersicht", Icon: LayoutDashboard },
  {
    href: "/admin/reservations",
    label: "Reservierungen",
    Icon: CalendarCheck,
    permission: "reservations.manage",
  },
  { href: "/admin/menu", label: "Speisekarte", Icon: UtensilsCrossed, permission: "menu.manage" },
];

export default function AdminShell({
  children,
  name,
  email,
  roleLabel,
  permissions,
  newCount,
  defaultOpen,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const canReservations = permissions.includes("reservations.manage");
  const nav = NAV.filter((n) => !n.permission || permissions.includes(n.permission));
  const current = nav.find((n) =>
    n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href),
  );
  const [live, setLive] = useState(false);

  // Live: a reservation submitted on the website lands here immediately, on every admin page.
  useEffect(() => {
    if (!canReservations) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-reservations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const r = payload.new as Reservation;
            toast.success(`Neue Reservierung: ${r.name}`, {
              description: `${guests(r.guests)} · ${shortDate(r.reservation_date)} · ${time(r)} Uhr`,
              action: {
                label: "Öffnen",
                onClick: () => router.push(`/admin/reservations?status=new&open=${r.id}`),
              },
            });
          }
          router.refresh();
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [canReservations, router]);

  useEffect(() => {
    document.title = newCount ? `(${newCount}) Admin — Auréa` : "Admin — Auréa";
  }, [newCount]);

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <a
        href="#admin-main"
        className="sr-only z-50 rounded bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Zum Inhalt springen
      </a>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4 group-data-[collapsible=icon]:px-2">
          <Link href="/admin" className="flex items-center gap-2" aria-label="Auréa Admin">
            <img
              src="/logo-light.svg"
              alt=""
              width={645}
              height={167}
              className="h-7 w-auto group-data-[collapsible=icon]:hidden"
            />
            <img
              src="/icon.svg"
              alt=""
              width={32}
              height={32}
              className="hidden size-8 rounded group-data-[collapsible=icon]:block"
            />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50">Verwaltung</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map(({ href, label, Icon }) => {
                  const active = current?.href === href;
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={label}
                        className="h-10 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                      >
                        <Link href={href} aria-current={active ? "page" : undefined}>
                          <Icon aria-hidden />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {href === "/admin/reservations" && newCount > 0 && (
                        <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground peer-hover/menu-button:text-sidebar-primary-foreground">
                          <span aria-hidden>{newCount}</span>
                          <span className="sr-only">{newCount} offene Anfragen</span>
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Website ansehen" className="h-10">
                    {/* The dashboard runs on the admin host; the website is the main domain. */}
                    <a href={SITE_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden />
                      <span>Website ansehen</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                      {initials}
                    </span>
                    <span className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium text-sidebar-accent-foreground">
                        {name}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/60">
                        {roleLabel}
                      </span>
                    </span>
                    <ChevronsUpDown className="ml-auto size-4" aria-hidden />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-60">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <form action={signOut}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className="w-full">
                        <LogOut aria-hidden /> Abmelden
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ml-1 size-9" aria-label="Seitenleiste umschalten" />
          <Separator orientation="vertical" className="h-5" />
          <p className="truncate text-sm font-medium">{current?.label ?? "Admin"}</p>
          {canReservations && (
            <span
              className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground"
              title={live ? "Neue Reservierungen erscheinen sofort" : "Verbinde…"}
            >
              <span className="relative flex size-2">
                {live && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-olive/60 motion-reduce:hidden" />
                )}
                <span
                  className={`relative inline-flex size-2 rounded-full ${live ? "bg-olive" : "bg-muted-foreground/40"}`}
                />
              </span>
              <span className="hidden sm:inline">{live ? "Live" : "Verbinde…"}</span>
            </span>
          )}
        </header>
        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none md:px-8 md:py-8"
        >
          {children}
        </main>
      </SidebarInset>
      <Toaster position="top-right" richColors closeButton />
    </SidebarProvider>
  );
}
