"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CircleSlash,
  Eye,
  EyeOff,
  FolderPlus,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteCategory,
  deleteMenuItem,
  discardUpload,
  reorderCategories,
  reorderMenuItems,
  saveCategory,
  saveMenuItem,
  setCategoryPublished,
  setMenuItemFlags,
} from "@/app/admin/actions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ALLERGENS,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MENU_BUCKET,
  allergenLabels,
  imageUrl,
  priceLabel,
} from "@/lib/menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/lib/types";

import { euro } from "./format";
import { PageHeader } from "./PageHeader";

type ItemDraft = {
  id: number | null;
  category_id: number;
  name: string;
  description: string;
  /** English texts; blank falls back to German on the English site. */
  name_en: string;
  description_en: string;
  price: string;
  tag: "" | "V" | "VG";
  allergens: string[];
  /** The saved photo; null once removed in the form. */
  image_path: string | null;
  /** A newly chosen photo, uploaded on save. */
  file: File | null;
  is_visible: boolean;
  is_available: boolean;
  sort_order: number;
};

type CategoryDraft = {
  id: number | null;
  name: string;
  name_en: string;
  parent_id: number | null;
  is_published: boolean;
};

type Pending =
  | { kind: "item"; item: MenuItem }
  | { kind: "category"; category: MenuCategory; subs: number; dishes: number }
  | null;

type Flags = { id: number; is_visible?: boolean; is_available?: boolean };

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const bySort = <T extends { sort_order: number; id: number }>(a: T, b: T) =>
  a.sort_order - b.sort_order || a.id - b.id;

/** Swaps an entry with its neighbour and returns the new id order for the server. */
function moved<T extends { id: number }>(list: T[], id: number, dir: -1 | 1) {
  const ids = list.map((x) => x.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return null;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  return ids;
}

export default function MenuView({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [catDraft, setCatDraft] = useState<CategoryDraft | null>(null);
  const [confirming, setConfirming] = useState<Pending>(null);
  const [pending, startTransition] = useTransition();
  const [list, setFlags] = useOptimistic(items, (is, f: Flags) =>
    is.map((i) => (i.id === f.id ? { ...i, ...f } : i)),
  );

  const tops = useMemo(
    () => categories.filter((c) => c.parent_id === null).sort(bySort),
    [categories],
  );
  const subsOf = (id: number) => categories.filter((c) => c.parent_id === id).sort(bySort);
  const itemsIn = (id: number) => list.filter((i) => i.category_id === id).sort(bySort);
  const byId = (id: number) => categories.find((c) => c.id === id);
  const pathOf = (c: MenuCategory) => {
    const parent = c.parent_id ? byId(c.parent_id) : null;
    return parent ? `${parent.name} › ${c.name}` : c.name;
  };
  /** Dishes in a category plus its subcategories. */
  const totalIn = (id: number) =>
    itemsIn(id).length + subsOf(id).reduce((n, s) => n + itemsIn(s.id).length, 0);

  function run(action: () => Promise<{ error?: string }>, success: string, after?: () => void) {
    startTransition(async () => {
      const res = await action();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(success);
      after?.();
      router.refresh();
    });
  }

  function flag(i: MenuItem, f: Omit<Flags, "id">, message: string) {
    startTransition(async () => {
      setFlags({ id: i.id, ...f });
      const res = await setMenuItemFlags(i.id, f);
      if (res.error) toast.error(res.error);
      else toast.success(message);
      router.refresh();
    });
  }

  const moveCategory = (c: MenuCategory, dir: -1 | 1) => {
    const siblings = c.parent_id === null ? tops : subsOf(c.parent_id);
    const ids = moved(siblings, c.id, dir);
    if (ids) run(() => reorderCategories(ids), "Reihenfolge gespeichert");
  };
  const moveItem = (i: MenuItem, dir: -1 | 1) => {
    const ids = moved(itemsIn(i.category_id), i.id, dir);
    if (ids) run(() => reorderMenuItems(ids), "Reihenfolge gespeichert");
  };

  async function saveItem(d: ItemDraft) {
    let uploaded: string | null = null;
    if (d.file) {
      const ext = IMAGE_TYPES[d.file.type as keyof typeof IMAGE_TYPES];
      uploaded = `items/${crypto.randomUUID()}.${ext}`;
      // Straight to Storage: its policies only let menu managers write to this bucket.
      const { error } = await createClient()
        .storage.from(MENU_BUCKET)
        .upload(uploaded, d.file, { contentType: d.file.type, upsert: false });
      if (error) return { error: `Bild-Upload fehlgeschlagen: ${error.message}` };
    }
    const res = await saveMenuItem(d.id, {
      category_id: d.category_id,
      name: d.name,
      description: d.description,
      name_en: d.name_en,
      description_en: d.description_en,
      price: d.price,
      tag: d.tag || null,
      allergens: d.allergens,
      image_path: uploaded ?? d.image_path,
      is_visible: d.is_visible,
      is_available: d.is_available,
      sort_order: d.sort_order,
    });
    if (res.error && uploaded) await discardUpload(uploaded);
    return res;
  }

  const q = query.trim().toLowerCase();
  const matches = (i: MenuItem) =>
    !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);

  // What the main column shows: top-level groups, each with its own dishes and subcategories.
  const groups = useMemo(() => {
    const selected = active === "all" ? null : categories.find((c) => c.id === active);
    const topIds = selected ? [selected.parent_id ?? selected.id] : tops.map((c) => c.id);
    return topIds
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is MenuCategory => !!c)
      .map((c) => {
        const showSelf = !selected || selected.id === c.id;
        const subs = categories
          .filter((s) => s.parent_id === c.id && (!selected || showSelf || s.id === selected.id))
          .sort(bySort)
          .map((s) => ({
            category: s,
            rows: list.filter((i) => i.category_id === s.id && matches(i)).sort(bySort),
          }))
          .filter((s) => !q || s.rows.length > 0);
        const rows = showSelf
          ? list.filter((i) => i.category_id === c.id && matches(i)).sort(bySort)
          : [];
        return { category: c, showSelf, rows, subs };
      })
      .filter((g) => !q || g.rows.length > 0 || g.subs.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matches only depends on q
  }, [categories, tops, list, active, q]);

  const blankItem = (category_id: number): ItemDraft => ({
    id: null,
    category_id,
    name: "",
    description: "",
    name_en: "",
    description_en: "",
    price: "",
    tag: "",
    allergens: [],
    image_path: null,
    file: null,
    is_visible: true,
    is_available: true,
    sort_order: itemsIn(category_id).reduce((m, i) => Math.max(m, i.sort_order), 0) + 1,
  });

  const fromItem = (i: MenuItem): ItemDraft => ({
    id: i.id,
    category_id: i.category_id,
    name: i.name,
    description: i.description,
    name_en: i.name_en ?? "",
    description_en: i.description_en ?? "",
    price: priceLabel(i.price),
    tag: i.tag ?? "",
    allergens: i.allergens ?? [],
    image_path: i.image_path,
    file: null,
    is_visible: i.is_visible,
    is_available: i.is_available,
    sort_order: i.sort_order,
  });

  const hiddenCount = list.filter((i) => !i.is_visible).length;
  const defaultCategory = active === "all" ? (tops[0]?.id ?? 0) : active;

  const categoryControls = (c: MenuCategory, index: number, count: number) => (
    <CategoryHeader
      category={c}
      path={pathOf(c)}
      dishes={totalIn(c.id)}
      first={index === 0}
      last={index === count - 1}
      pending={pending}
      onMove={(dir) => moveCategory(c, dir)}
      onPublish={(v) =>
        run(
          () => setCategoryPublished(c.id, v),
          v ? `„${c.name}“ veröffentlicht` : `„${c.name}“ ausgeblendet`,
        )
      }
      onEdit={() =>
        setCatDraft({
          id: c.id,
          name: c.name,
          name_en: c.name_en ?? "",
          parent_id: c.parent_id,
          is_published: c.is_published,
        })
      }
      onAddSub={
        c.parent_id === null
          ? () =>
              setCatDraft({ id: null, name: "", name_en: "", parent_id: c.id, is_published: true })
          : undefined
      }
      onAddItem={() => setDraft(blankItem(c.id))}
      onDelete={() =>
        setConfirming({
          kind: "category",
          category: c,
          subs: subsOf(c.id).length,
          dishes: totalIn(c.id),
        })
      }
    />
  );

  const itemRows = (rows: MenuItem[]) => {
    const siblings = rows.length ? itemsIn(rows[0]!.category_id) : [];
    return rows.length === 0 ? (
      <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
        {q ? "Keine Treffer." : "Noch keine Gerichte."}
      </p>
    ) : (
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card/40">
        {rows.map((i) => {
          const pos = siblings.findIndex((s) => s.id === i.id);
          return (
            <ItemRow
              key={i.id}
              item={i}
              first={pos === 0}
              last={pos === siblings.length - 1}
              reorderable={!q}
              pending={pending}
              onEdit={() => setDraft(fromItem(i))}
              onMove={(dir) => moveItem(i, dir)}
              onPublish={(v) =>
                flag(
                  i,
                  { is_visible: v },
                  v ? `„${i.name}“ veröffentlicht` : `„${i.name}“ ausgeblendet`,
                )
              }
              onAvailable={(v) =>
                flag(
                  i,
                  { is_available: v },
                  v
                    ? `„${i.name}“ ist wieder verfügbar`
                    : `„${i.name}“ als nicht verfügbar markiert`,
                )
              }
              onDelete={() => setConfirming({ kind: "item", item: i })}
            />
          );
        })}
      </ul>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Speisekarte"
        description={`${list.length} Gerichte in ${categories.length} Kategorien${
          hiddenCount ? ` · ${hiddenCount} ausgeblendet` : ""
        }`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setCatDraft({
                  id: null,
                  name: "",
                  name_en: "",
                  parent_id: null,
                  is_published: true,
                })
              }
              className="h-10"
            >
              <FolderPlus aria-hidden /> Kategorie
            </Button>
            <Button
              onClick={() => setDraft(blankItem(defaultCategory))}
              disabled={!categories.length}
              className="h-10"
            >
              <Plus aria-hidden /> Gericht hinzufügen
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Categories: a picker on small screens, a tree on desktop */}
        <div>
          <Label htmlFor="menu-filter" className="sr-only lg:hidden">
            Kategorie anzeigen
          </Label>
          <select
            id="menu-filter"
            value={active}
            onChange={(e) => setActive(e.target.value === "all" ? "all" : Number(e.target.value))}
            className={cn(selectCls, "lg:hidden")}
          >
            <option value="all">Alle Kategorien ({list.length})</option>
            {tops.map((c) => [
              <option key={c.id} value={c.id}>
                {c.name} ({totalIn(c.id)})
              </option>,
              ...subsOf(c.id).map((s) => (
                <option key={s.id} value={s.id}>
                  {"   "}↳ {s.name} ({itemsIn(s.id).length})
                </option>
              )),
            ])}
          </select>

          <nav aria-label="Kategorien" className="hidden lg:block">
            <ul className="grid gap-0.5">
              <NavEntry
                label="Alle"
                count={list.length}
                current={active === "all"}
                onClick={() => setActive("all")}
              />
              {tops.map((c) => (
                <li key={c.id}>
                  <ul className="grid gap-0.5">
                    <NavEntry
                      label={c.name}
                      count={totalIn(c.id)}
                      hidden={!c.is_published}
                      current={active === c.id}
                      onClick={() => setActive(c.id)}
                    />
                    {subsOf(c.id).map((s) => (
                      <NavEntry
                        key={s.id}
                        sub
                        label={s.name}
                        count={itemsIn(s.id).length}
                        hidden={!s.is_published || !c.is_published}
                        current={active === s.id}
                        onClick={() => setActive(s.id)}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="min-w-0">
          <div className="relative mb-4 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Gericht suchen"
              aria-label="Gerichte durchsuchen"
              className="h-9 pl-9"
            />
          </div>

          {groups.length === 0 ? (
            <div className="grid place-items-center rounded-lg border border-dashed border-border px-6 py-20 text-center">
              <UtensilsCrossed className="size-10 text-muted-foreground/60" aria-hidden />
              <p className="mt-4 text-lg font-semibold">
                {q ? "Keine Treffer" : "Noch keine Kategorien"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {q
                  ? `Kein Gericht passt zu „${query.trim()}“.`
                  : "Lege zuerst eine Kategorie an, z. B. „Breakfast“."}
              </p>
              {!q && (
                <Button
                  className="mt-6"
                  onClick={() =>
                    setCatDraft({
                      id: null,
                      name: "",
                      name_en: "",
                      parent_id: null,
                      is_published: true,
                    })
                  }
                >
                  <Plus aria-hidden /> Kategorie anlegen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map(({ category, showSelf, rows, subs }) => {
                const topIndex = tops.findIndex((t) => t.id === category.id);
                const siblings = subsOf(category.id);
                return (
                  <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                    {categoryControls(category, topIndex, tops.length)}
                    {showSelf && (rows.length > 0 || subs.length === 0) && itemRows(rows)}
                    {subs.length > 0 && (
                      <div className="mt-4 space-y-6 border-l-2 border-border pl-3 sm:pl-5">
                        {subs.map(({ category: s, rows: subRows }) => (
                          <section key={s.id} aria-labelledby={`cat-${s.id}`}>
                            {categoryControls(
                              s,
                              siblings.findIndex((x) => x.id === s.id),
                              siblings.length,
                            )}
                            {itemRows(subRows)}
                          </section>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ItemSheet
        draft={draft}
        tops={tops}
        subsOf={subsOf}
        pending={pending}
        onChange={setDraft}
        onSave={(d) =>
          run(
            () => saveItem(d),
            d.id ? "Gericht aktualisiert" : "Gericht hinzugefügt",
            () => setDraft(null),
          )
        }
      />

      <CategoryDialog
        draft={catDraft}
        tops={tops}
        hasSubs={catDraft?.id ? subsOf(catDraft.id).length > 0 : false}
        pending={pending}
        onChange={setCatDraft}
        onSave={(d) =>
          run(
            () =>
              saveCategory(d.id, {
                name: d.name,
                name_en: d.name_en,
                parent_id: d.parent_id,
                is_published: d.is_published,
              }),
            d.id
              ? "Kategorie gespeichert"
              : d.parent_id
                ? "Unterkategorie angelegt"
                : "Kategorie angelegt",
            () => setCatDraft(null),
          )
        }
      />

      <AlertDialog open={confirming !== null} onOpenChange={(o) => !o && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirming?.kind === "category"
                ? `${confirming.category.parent_id ? "Unterkategorie" : "Kategorie"} „${confirming.category.name}“ löschen?`
                : `„${confirming?.kind === "item" ? confirming.item.name : ""}“ löschen?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.kind === "category"
                ? deleteWarning(confirming.subs, confirming.dishes)
                : "Das Gericht und sein Foto verschwinden sofort von der Website. Tipp: Ausblenden statt löschen, wenn es nur vorübergehend fehlt."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                const c = confirming;
                if (!c) return;
                if (c.kind === "item") run(() => deleteMenuItem(c.item.id), "Gericht gelöscht");
                else {
                  run(() => deleteCategory(c.category.id), "Kategorie gelöscht");
                  if (
                    active === c.category.id ||
                    subsOf(c.category.id).some((s) => s.id === active)
                  )
                    setActive("all");
                }
              }}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <span className="sr-only" aria-live="polite">
        {pending ? "Wird gespeichert" : ""}
      </span>
    </div>
  );
}

function deleteWarning(subs: number, dishes: number) {
  const parts = [
    subs && `${subs} ${subs === 1 ? "Unterkategorie" : "Unterkategorien"}`,
    dishes && `${dishes} ${dishes === 1 ? "Gericht" : "Gerichte"}`,
  ].filter(Boolean);
  return parts.length
    ? `Dabei werden auch ${parts.join(" und ")} gelöscht. Das lässt sich nicht rückgängig machen. Tipp: Ausblenden statt löschen, wenn sie nur vorübergehend fehlt.`
    : "Die Kategorie ist leer. Das lässt sich nicht rückgängig machen.";
}

function NavEntry({
  label,
  count,
  current,
  hidden,
  sub,
  onClick,
}: {
  label: string;
  count: number;
  current: boolean;
  hidden?: boolean;
  sub?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        aria-current={current ? "true" : undefined}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-md px-3 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          sub && "pl-7",
          current
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-1.5", hidden && "opacity-60")}>
          {hidden && <EyeOff className="size-3 shrink-0" aria-label="ausgeblendet" />}
          <span className="truncate">{label}</span>
        </span>
        <span className="text-xs tabular-nums opacity-70">{count}</span>
      </button>
    </li>
  );
}

/** Marks entries whose English text is missing; the English site then shows German. */
function MissingEnglish() {
  return (
    <span
      title="Englische Übersetzung fehlt – die englische Seite zeigt den deutschen Text."
      className="rounded border border-dashed border-border px-1.5 text-[0.65rem] font-normal uppercase tracking-wide text-muted-foreground"
    >
      EN fehlt
    </span>
  );
}

function MoveButtons({
  label,
  first,
  last,
  disabled,
  onMove,
}: {
  label: string;
  first: boolean;
  last: boolean;
  disabled: boolean;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <span className="flex shrink-0">
      <Button
        size="icon"
        variant="ghost"
        className="size-9"
        disabled={first || disabled}
        onClick={() => onMove(-1)}
        aria-label={`${label} nach oben`}
      >
        <ArrowUp aria-hidden />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-9"
        disabled={last || disabled}
        onClick={() => onMove(1)}
        aria-label={`${label} nach unten`}
      >
        <ArrowDown aria-hidden />
      </Button>
    </span>
  );
}

function CategoryHeader({
  category: c,
  path,
  dishes,
  first,
  last,
  pending,
  onMove,
  onPublish,
  onEdit,
  onAddSub,
  onAddItem,
  onDelete,
}: {
  category: MenuCategory;
  path: string;
  dishes: number;
  first: boolean;
  last: boolean;
  pending: boolean;
  onMove: (dir: -1 | 1) => void;
  onPublish: (v: boolean) => void;
  onEdit: () => void;
  onAddSub?: (() => void) | undefined;
  onAddItem: () => void;
  onDelete: () => void;
}) {
  const Heading = c.parent_id ? "h3" : "h2";
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1">
      <Heading
        id={`cat-${c.id}`}
        className={cn(
          "flex min-w-0 items-center gap-2 font-semibold",
          c.parent_id ? "text-sm" : "text-base",
        )}
      >
        <span className={cn("truncate", !c.is_published && "opacity-60")}>{c.name}</span>
        <span className="font-normal text-muted-foreground">{dishes}</span>
        {!c.name_en && <MissingEnglish />}
        {!c.is_published && (
          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[0.7rem] font-normal text-muted-foreground">
            <EyeOff className="size-3" aria-hidden /> ausgeblendet
          </span>
        )}
      </Heading>
      <div className="flex items-center gap-1">
        <MoveButtons label={path} first={first} last={last} disabled={pending} onMove={onMove} />
        <Switch
          checked={c.is_published}
          onCheckedChange={onPublish}
          disabled={pending}
          aria-label={`„${path}“ auf der Website anzeigen`}
          className="mx-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="size-9"
              aria-label={`Aktionen für ${c.parent_id ? "Unterkategorie" : "Kategorie"} ${path}`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onAddItem}>
              <Plus aria-hidden /> Gericht hinzufügen
            </DropdownMenuItem>
            {onAddSub && (
              <DropdownMenuItem onSelect={onAddSub}>
                <FolderPlus aria-hidden /> Unterkategorie anlegen
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil aria-hidden /> Umbenennen / verschieben
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onPublish(!c.is_published)}>
              {c.is_published ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              {c.is_published ? "Ausblenden" : "Veröffentlichen"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 aria-hidden /> Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ItemRow({
  item: i,
  first,
  last,
  reorderable,
  pending,
  onEdit,
  onMove,
  onPublish,
  onAvailable,
  onDelete,
}: {
  item: MenuItem;
  first: boolean;
  last: boolean;
  reorderable: boolean;
  pending: boolean;
  onEdit: () => void;
  onMove: (dir: -1 | 1) => void;
  onPublish: (v: boolean) => void;
  onAvailable: (v: boolean) => void;
  onDelete: () => void;
}) {
  const allergens = allergenLabels(i.allergens ?? []);
  return (
    <li className="flex items-center gap-3 px-3 py-3 transition-colors duration-150 hover:bg-muted/40 sm:px-4">
      <button
        onClick={onEdit}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !i.is_visible && "opacity-55",
        )}
      >
        {i.image_path ? (
          <img
            src={imageUrl(i.image_path)}
            alt=""
            loading="lazy"
            className="size-11 shrink-0 rounded object-cover"
          />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded bg-muted text-muted-foreground">
            <ImageIcon className="size-4" aria-hidden />
          </span>
        )}
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium">{i.name}</span>
            {i.tag && (
              <span
                className="rounded border border-olive/40 px-1.5 text-[0.7rem] font-medium text-olive"
                title={i.tag === "V" ? "vegetarisch" : "vegan"}
              >
                {i.tag}
              </span>
            )}
            {!i.is_visible && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <EyeOff className="size-3" aria-hidden /> ausgeblendet
              </span>
            )}
            {!i.is_available && (
              <span className="inline-flex items-center gap-1 text-xs text-destructive">
                <CircleSlash className="size-3" aria-hidden /> nicht verfügbar
              </span>
            )}
            {(!i.name_en || (i.description && !i.description_en)) && <MissingEnglish />}
          </span>
          {i.description && (
            <span className="mt-0.5 block truncate text-sm text-muted-foreground">
              {i.description}
            </span>
          )}
          {allergens.length > 0 && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              Allergene: {allergens.join(", ")}
            </span>
          )}
        </span>
      </button>
      <span className="w-16 shrink-0 text-right text-sm tabular-nums">{euro(i.price)}</span>
      {reorderable && (
        <span className="hidden sm:flex">
          <MoveButtons
            label={i.name}
            first={first}
            last={last}
            disabled={pending}
            onMove={onMove}
          />
        </span>
      )}
      <Switch
        checked={i.is_visible}
        onCheckedChange={onPublish}
        aria-label={`„${i.name}“ auf der Website anzeigen`}
        className="hidden sm:inline-flex"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 shrink-0"
            aria-label={`Aktionen für ${i.name}`}
          >
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil aria-hidden /> Bearbeiten
          </DropdownMenuItem>
          {reorderable && !first && (
            <DropdownMenuItem onSelect={() => onMove(-1)} className="sm:hidden">
              <ArrowUp aria-hidden /> Nach oben
            </DropdownMenuItem>
          )}
          {reorderable && !last && (
            <DropdownMenuItem onSelect={() => onMove(1)} className="sm:hidden">
              <ArrowDown aria-hidden /> Nach unten
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => onPublish(!i.is_visible)}>
            {i.is_visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            {i.is_visible ? "Ausblenden" : "Veröffentlichen"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAvailable(!i.is_available)}>
            <CircleSlash aria-hidden />
            {i.is_available ? "Nicht verfügbar" : "Wieder verfügbar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 aria-hidden /> Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

const PRICE = /^\d{1,4}([.,]\d{1,2})?$/;

function ItemSheet({
  draft,
  tops,
  subsOf,
  pending,
  onChange,
  onSave,
}: {
  draft: ItemDraft | null;
  tops: MenuCategory[];
  subsOf: (id: number) => MenuCategory[];
  pending: boolean;
  onChange: (d: ItemDraft | null) => void;
  onSave: (d: ItemDraft) => void;
}) {
  const priceOk = !draft || PRICE.test(draft.price.trim());
  const [touched, setTouched] = useState(false);
  const [imageError, setImageError] = useState("");
  // A local preview for a newly picked file; revoked when it changes or the sheet closes.
  const preview = useMemo(
    () => (draft?.file ? URL.createObjectURL(draft.file) : null),
    [draft?.file],
  );
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  const shown = preview ?? (draft?.image_path ? imageUrl(draft.image_path) : null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (draft && priceOk && draft.category_id) onSave({ ...draft, price: draft.price.trim() });
  }

  function pick(file: File | undefined) {
    if (!draft || !file) return;
    if (!(file.type in IMAGE_TYPES))
      return setImageError("Bitte ein JPG-, PNG- oder WebP-Bild wählen.");
    if (file.size > MAX_IMAGE_BYTES) return setImageError("Das Bild ist größer als 5 MB.");
    setImageError("");
    onChange({ ...draft, file });
  }

  return (
    <Sheet
      open={draft !== null}
      onOpenChange={(o) => {
        if (!o) {
          onChange(null);
          setTouched(false);
          setImageError("");
        }
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {draft && (
          <form onSubmit={submit} className="flex h-full flex-col" noValidate>
            <SheetHeader className="border-b border-border p-6 text-left">
              <SheetTitle className="text-2xl font-semibold tracking-tight">
                {draft.id ? "Gericht bearbeiten" : "Neues Gericht"}
              </SheetTitle>
              <SheetDescription>Änderungen sind sofort auf der Website sichtbar.</SheetDescription>
            </SheetHeader>

            <div className="grid flex-1 content-start gap-5 overflow-y-auto p-6">
              <div className="grid gap-2">
                <Label htmlFor="item-name">Name</Label>
                <Input
                  id="item-name"
                  required
                  maxLength={120}
                  autoFocus
                  value={draft.name}
                  onChange={(e) => onChange({ ...draft, name: e.target.value })}
                  aria-invalid={touched && !draft.name.trim()}
                  className={cn("h-10", touched && !draft.name.trim() && "border-destructive")}
                />
                {touched && !draft.name.trim() && (
                  <p className="text-xs text-destructive">Bitte einen Namen eingeben.</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-desc">Beschreibung</Label>
                <Textarea
                  id="item-desc"
                  rows={3}
                  maxLength={300}
                  value={draft.description}
                  onChange={(e) => onChange({ ...draft, description: e.target.value })}
                  placeholder="Zutaten, kurz und appetitlich"
                  className="resize-none"
                />
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {draft.description.length}/300
                </p>
              </div>
              <fieldset className="grid gap-4 rounded-md border border-dashed border-border p-4">
                <legend className="px-1 text-sm font-medium">
                  Englisch <span className="font-normal text-muted-foreground">(optional)</span>
                </legend>
                <p className="-mt-2 text-xs text-muted-foreground">
                  Leer gelassen zeigt die englische Seite den deutschen Text.
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="item-name-en">Name (EN)</Label>
                  <Input
                    id="item-name-en"
                    lang="en"
                    maxLength={120}
                    value={draft.name_en}
                    onChange={(e) => onChange({ ...draft, name_en: e.target.value })}
                    placeholder={draft.name}
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="item-desc-en">Beschreibung (EN)</Label>
                  <Textarea
                    id="item-desc-en"
                    lang="en"
                    rows={3}
                    maxLength={300}
                    value={draft.description_en}
                    onChange={(e) => onChange({ ...draft, description_en: e.target.value })}
                    placeholder={draft.description}
                    className="resize-none"
                  />
                </div>
              </fieldset>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid content-start gap-2">
                  <Label htmlFor="item-price">Preis (€)</Label>
                  <Input
                    id="item-price"
                    required
                    inputMode="decimal"
                    placeholder="13,90"
                    value={draft.price}
                    onChange={(e) => onChange({ ...draft, price: e.target.value })}
                    onBlur={() => setTouched(true)}
                    aria-invalid={touched && !priceOk}
                    aria-describedby="item-price-error"
                    className={cn("h-10", touched && !priceOk && "border-destructive")}
                  />
                  <p id="item-price-error" className="min-h-4 text-xs text-destructive">
                    {touched && !priceOk ? "Format: 13,90" : ""}
                  </p>
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="item-cat">Kategorie</Label>
                  <select
                    id="item-cat"
                    value={draft.category_id}
                    onChange={(e) => onChange({ ...draft, category_id: Number(e.target.value) })}
                    className={selectCls}
                  >
                    {tops.map((c) => [
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>,
                      ...subsOf(c.id).map((s) => (
                        <option key={s.id} value={s.id}>
                          {"   "}↳ {s.name}
                        </option>
                      )),
                    ])}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium" id="item-image-label">
                  Foto <span className="font-normal text-muted-foreground">(optional)</span>
                </span>
                <div className="flex items-center gap-4">
                  {shown ? (
                    <img
                      src={shown}
                      alt="Vorschau"
                      className="size-20 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <span className="grid size-20 shrink-0 place-items-center rounded-md border border-dashed border-border text-muted-foreground">
                      <ImageIcon className="size-5" aria-hidden />
                    </span>
                  )}
                  <div className="grid gap-2">
                    <Label
                      htmlFor="item-image"
                      className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input px-3 text-sm font-normal shadow-sm hover:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                    >
                      {shown ? "Anderes Foto wählen" : "Foto wählen"}
                      <input
                        id="item-image"
                        type="file"
                        accept={Object.keys(IMAGE_TYPES).join(",")}
                        aria-describedby="item-image-hint"
                        className="sr-only"
                        onChange={(e) => {
                          pick(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </Label>
                    {shown && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 justify-start px-2 text-muted-foreground"
                        onClick={() =>
                          onChange({
                            ...draft,
                            file: null,
                            image_path: draft.file ? draft.image_path : null,
                          })
                        }
                      >
                        <X aria-hidden /> {draft.file ? "Auswahl verwerfen" : "Foto entfernen"}
                      </Button>
                    )}
                  </div>
                </div>
                <p
                  id="item-image-hint"
                  className={cn(
                    "text-xs",
                    imageError ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {imageError || "JPG, PNG oder WebP, höchstens 5 MB."}
                </p>
              </div>

              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">Kennzeichnung</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["", "Keine"],
                      ["V", "Vegetarisch"],
                      ["VG", "Vegan"],
                    ] as const
                  ).map(([v, label]) => (
                    <label key={v} className="cursor-pointer">
                      <input
                        type="radio"
                        name="tag"
                        checked={draft.tag === v}
                        onChange={() => onChange({ ...draft, tag: v })}
                        className="peer sr-only"
                      />
                      <span className="flex h-10 items-center justify-center rounded-md border border-border text-sm transition-colors duration-200 hover:border-foreground/40 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">
                  Allergene{" "}
                  <span className="font-normal text-muted-foreground">
                    ({draft.allergens.length || "keine"})
                  </span>
                </legend>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {ALLERGENS.map((a) => {
                    const checked = draft.allergens.includes(a.key);
                    return (
                      <label key={a.key} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onChange({
                              ...draft,
                              allergens: checked
                                ? draft.allergens.filter((k) => k !== a.key)
                                : [...draft.allergens, a.key],
                            })
                          }
                          className="size-4 accent-foreground"
                        />
                        {a.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-2">
                <Label htmlFor="item-order">Position</Label>
                <Input
                  id="item-order"
                  type="number"
                  min={0}
                  max={9999}
                  value={draft.sort_order}
                  onChange={(e) => onChange({ ...draft, sort_order: Number(e.target.value) || 0 })}
                  className="h-10 w-28"
                />
                <p className="text-xs text-muted-foreground">
                  Kleinere Zahlen stehen weiter oben. In der Liste geht es auch mit ↑ ↓.
                </p>
              </div>

              <ToggleRow
                id="item-available"
                title="Verfügbar"
                hint="Nicht verfügbare Gerichte bleiben sichtbar, mit dem Hinweis „Derzeit nicht verfügbar“."
                checked={draft.is_available}
                onChange={(v) => onChange({ ...draft, is_available: v })}
              />
              <ToggleRow
                id="item-visible"
                title="Auf der Website veröffentlicht"
                hint="Ausgeblendete Gerichte bleiben hier gespeichert."
                checked={draft.is_visible}
                onChange={(v) => onChange({ ...draft, is_visible: v })}
              />
            </div>

            <SheetFooter className="border-t border-border p-6 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => onChange(null)}
                className="h-10"
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={pending} className="h-10">
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                <span>{pending ? "Speichert…" : draft.id ? "Änderungen speichern" : "Gericht anlegen"}</span>
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ToggleRow({
  id,
  title,
  hint,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border p-4"
    >
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function CategoryDialog({
  draft,
  tops,
  hasSubs,
  pending,
  onChange,
  onSave,
}: {
  draft: CategoryDraft | null;
  tops: MenuCategory[];
  hasSubs: boolean;
  pending: boolean;
  onChange: (d: CategoryDraft | null) => void;
  onSave: (d: CategoryDraft) => void;
}) {
  const parents = tops.filter((c) => c.id !== draft?.id);
  return (
    <Dialog open={draft !== null} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="sm:max-w-sm">
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.name.trim()) onSave({ ...draft, name: draft.name.trim() });
            }}
            className="grid gap-5"
          >
            <DialogHeader>
              <DialogTitle>
                {draft.id
                  ? "Kategorie bearbeiten"
                  : draft.parent_id
                    ? "Neue Unterkategorie"
                    : "Neue Kategorie"}
              </DialogTitle>
              <DialogDescription>
                Hauptkategorien erscheinen als Reiter in der Karte, Unterkategorien als
                Zwischenüberschrift darin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                autoFocus
                required
                maxLength={60}
                placeholder="z. B. Brunch"
                value={draft.name}
                onChange={(e) => onChange({ ...draft, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-name-en">
                Name Englisch <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cat-name-en"
                lang="en"
                maxLength={60}
                placeholder={draft.name || "z. B. Brunch"}
                value={draft.name_en}
                onChange={(e) => onChange({ ...draft, name_en: e.target.value })}
                aria-describedby="cat-name-en-hint"
                className="h-10"
              />
              <p id="cat-name-en-hint" className="text-xs text-muted-foreground">
                Leer gelassen zeigt die englische Seite den deutschen Namen.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-parent">Liegt in</Label>
              <select
                id="cat-parent"
                value={draft.parent_id ?? ""}
                disabled={hasSubs}
                aria-describedby={hasSubs ? "cat-parent-hint" : undefined}
                onChange={(e) =>
                  onChange({ ...draft, parent_id: e.target.value ? Number(e.target.value) : null })
                }
                className={selectCls}
              >
                <option value="">— Hauptkategorie —</option>
                {parents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {hasSubs && (
                <p id="cat-parent-hint" className="text-xs text-muted-foreground">
                  Hat eigene Unterkategorien und bleibt deshalb eine Hauptkategorie.
                </p>
              )}
            </div>
            <ToggleRow
              id="cat-published"
              title="Veröffentlicht"
              hint="Ausgeblendet verschwindet sie samt Inhalt von der Website."
              checked={draft.is_published}
              onChange={(v) => onChange({ ...draft, is_published: v })}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onChange(null)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={pending || !draft.name.trim()}>
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                <span>{draft.id ? "Speichern" : "Anlegen"}</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
