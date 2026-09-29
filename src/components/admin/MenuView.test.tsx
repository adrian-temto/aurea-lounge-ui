import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { MenuCategory, MenuItem } from "@/lib/types";

import MenuView from "./MenuView";

const actions = vi.hoisted(() => ({
  saveCategory: vi.fn(),
  setCategoryPublished: vi.fn(),
  deleteCategory: vi.fn(),
  reorderCategories: vi.fn(),
  saveMenuItem: vi.fn(),
  setMenuItemFlags: vi.fn(),
  reorderMenuItems: vi.fn(),
  deleteMenuItem: vi.fn(),
  discardUpload: vi.fn(),
}));
vi.mock("@/app/admin/actions", () => actions);
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const upload = vi.hoisted(() => vi.fn(async () => ({ error: null })));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ storage: { from: () => ({ upload }) } }),
}));

beforeAll(() => {
  // These walk through whole dialogs; give slower machines room.
  vi.setConfig({ testTimeout: 20_000 });
  // Radix menus rely on these browser APIs, which jsdom lacks.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // Node has its own createObjectURL, which cannot read jsdom File objects.
  URL.createObjectURL = () => "blob:preview";
  URL.revokeObjectURL = () => {};
});

beforeEach(() => {
  Object.values(actions).forEach((a) => a.mockReset().mockResolvedValue({}));
  upload.mockClear();
});

const categories: MenuCategory[] = [
  { id: 1, name: "Breakfast", sort_order: 1, parent_id: null, is_published: true, name_en: null },
  { id: 2, name: "Drinks", sort_order: 2, parent_id: null, is_published: true, name_en: null },
  { id: 3, name: "Coffee", sort_order: 1, parent_id: 2, is_published: true, name_en: null },
];
const dish = (i: Partial<MenuItem> & Pick<MenuItem, "id" | "name" | "category_id">): MenuItem => ({
  description: "",
  name_en: null,
  description_en: null,
  price: 9.9,
  tag: null,
  is_visible: true,
  is_available: true,
  allergens: [],
  image_path: null,
  sort_order: i.id,
  ...i,
});
const items = [
  // Fully translated, so its row carries no "EN fehlt" badge.
  dish({ id: 10, name: "Eggs Benedict", name_en: "Eggs Benedict", category_id: 1, price: 13.9 }),
  dish({ id: 11, name: "Porridge", category_id: 1 }),
  dish({ id: 12, name: "Flat White", category_id: 3, price: 4.2 }),
];

const openActions = (name: string) =>
  userEvent.click(screen.getByRole("button", { name: `Aktionen für ${name}` }));

describe("menu dashboard", () => {
  it("shows the hierarchy: category → subcategory → dishes", () => {
    render(<MenuView categories={categories} items={items} />);
    const drinks = screen.getByRole("region", { name: /^Drinks/ });
    const coffee = within(drinks).getByRole("region", { name: /^Coffee/ });
    expect(within(coffee).getByText("Flat White")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /^Breakfast/ })).toHaveTextContent("Eggs Benedict");
  });

  it("creates a category, then a subcategory inside it", async () => {
    render(<MenuView categories={categories} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Kategorie" }));
    await userEvent.type(screen.getByLabelText("Name"), "Brunch");
    await userEvent.click(screen.getByRole("button", { name: "Anlegen" }));
    expect(actions.saveCategory).toHaveBeenCalledWith(null, {
      name: "Brunch",
      name_en: "",
      parent_id: null,
      is_published: true,
    });

    await openActions("Kategorie Drinks");
    await userEvent.click(screen.getByRole("menuitem", { name: /Unterkategorie anlegen/ }));
    expect(screen.getByRole("heading", { name: "Neue Unterkategorie" })).toBeInTheDocument();
    expect(screen.getByLabelText("Liegt in")).toHaveValue("2");
    await userEvent.type(screen.getByLabelText("Name"), "Tee");
    await userEvent.click(screen.getByRole("button", { name: "Anlegen" }));
    expect(actions.saveCategory).toHaveBeenLastCalledWith(null, {
      name: "Tee",
      name_en: "",
      parent_id: 2,
      is_published: true,
    });
  });

  it("adds a dish to a subcategory with allergens and a photo", async () => {
    render(<MenuView categories={categories} items={items} />);
    await openActions("Unterkategorie Drinks › Coffee");
    await userEvent.click(screen.getByRole("menuitem", { name: /Gericht hinzufügen/ }));

    await userEvent.type(screen.getByLabelText("Name"), "Cortado");
    await userEvent.type(screen.getByLabelText("Preis (€)"), "3,60");
    await userEvent.click(screen.getByLabelText("Milch"));
    const photo = new File(["x"], "cortado.webp", { type: "image/webp" });
    await userEvent.upload(screen.getByLabelText(/Foto wählen/), photo);
    expect(screen.getByAltText("Vorschau")).toHaveAttribute("src", "blob:preview");
    await userEvent.click(screen.getByRole("button", { name: "Gericht anlegen" }));

    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^items\/[0-9a-f-]{36}\.webp$/),
      photo,
      expect.objectContaining({ contentType: "image/webp" }),
    );
    expect(actions.saveMenuItem).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        category_id: 3,
        name: "Cortado",
        price: "3,60",
        allergens: ["milk"],
        image_path: expect.stringMatching(/^items\/.+\.webp$/),
        is_visible: true,
        is_available: true,
      }),
    );
  });

  it("rejects a malformed price in the form", async () => {
    render(<MenuView categories={categories} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Eggs Benedict" }));
    const price = screen.getByLabelText("Preis (€)");
    await userEvent.clear(price);
    await userEvent.type(price, "12.345");
    await userEvent.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(screen.getByText("Format: 13,90")).toBeInTheDocument();
    expect(actions.saveMenuItem).not.toHaveBeenCalled();
  });

  it("edits a price", async () => {
    render(<MenuView categories={categories} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Eggs Benedict" }));
    const price = screen.getByLabelText("Preis (€)");
    expect(price).toHaveValue("13,90");
    await userEvent.clear(price);
    await userEvent.type(price, "14,50");
    await userEvent.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(actions.saveMenuItem).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ price: "14,50", name: "Eggs Benedict" }),
    );
  });

  it("changes the display order of dishes and categories", async () => {
    render(<MenuView categories={categories} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Eggs Benedict nach unten" }));
    expect(actions.reorderMenuItems).toHaveBeenCalledWith([11, 10]);
    expect(screen.getByRole("button", { name: "Eggs Benedict nach oben" })).toBeDisabled();

    // Controls pause while a save is running.
    const up = screen.getByRole("button", { name: "Drinks nach oben" });
    await waitFor(() => expect(up).toBeEnabled());
    await userEvent.click(up);
    expect(actions.reorderCategories).toHaveBeenCalledWith([2, 1]);
  });

  it("unpublishes a dish and a category, and marks a dish sold out", async () => {
    render(<MenuView categories={categories} items={items} />);
    await userEvent.click(
      screen.getByRole("switch", { name: "„Porridge“ auf der Website anzeigen" }),
    );
    expect(actions.setMenuItemFlags).toHaveBeenCalledWith(11, { is_visible: false });

    await openActions("Flat White");
    await userEvent.click(screen.getByRole("menuitem", { name: /Nicht verfügbar/ }));
    expect(actions.setMenuItemFlags).toHaveBeenCalledWith(12, { is_available: false });

    const drinks = screen.getByRole("switch", { name: "„Drinks“ auf der Website anzeigen" });
    await waitFor(() => expect(drinks).toBeEnabled());
    await userEvent.click(drinks);
    expect(actions.setCategoryPublished).toHaveBeenCalledWith(2, false);
  });

  it("saves English texts, and blank ones as not translated", async () => {
    render(<MenuView categories={categories} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: /^Porridges*EN fehlt$/ }));
    await userEvent.type(screen.getByLabelText("Name (EN)"), "Porridge");
    await userEvent.type(screen.getByLabelText("Beschreibung (EN)"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(actions.saveMenuItem).toHaveBeenCalledWith(
      11,
      expect.objectContaining({ name: "Porridge", name_en: "Porridge", description_en: "   " }),
    );

    await openActions("Kategorie Drinks");
    await userEvent.click(screen.getByRole("menuitem", { name: /Umbenennen/ }));
    await userEvent.type(screen.getByLabelText(/Name Englisch/), "Beverages");
    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));
    expect(actions.saveCategory).toHaveBeenCalledWith(2, {
      name: "Drinks",
      name_en: "Beverages",
      parent_id: null,
      is_published: true,
    });
  });

  it("flags entries whose English translation is missing", () => {
    render(<MenuView categories={categories} items={items} />);
    const eggs = screen.getByRole("button", { name: "Eggs Benedict" });
    expect(eggs).not.toHaveTextContent("EN fehlt");
    expect(screen.getByRole("button", { name: /^Porridges*EN fehlt$/ })).toHaveTextContent(
      "EN fehlt",
    );
    expect(screen.getByRole("region", { name: /^Breakfast/ })).toHaveTextContent("EN fehlt");
  });

  it("asks before deleting and says what else goes with it", async () => {
    render(<MenuView categories={categories} items={items} />);
    await openActions("Kategorie Drinks");
    await userEvent.click(screen.getByRole("menuitem", { name: /Löschen/ }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("1 Unterkategorie und 1 Gericht");
    expect(actions.deleteCategory).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Endgültig löschen" }));
    expect(actions.deleteCategory).toHaveBeenCalledWith(2);
  });
});
