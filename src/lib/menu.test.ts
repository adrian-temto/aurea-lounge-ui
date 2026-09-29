import { describe, expect, it } from "vitest";

import { buildPublicMenu } from "./menu";
import type { MenuCategory, MenuItem } from "./types";

const cat = (c: Partial<MenuCategory> & { id: number; name: string }): MenuCategory => ({
  sort_order: c.id,
  parent_id: null,
  is_published: true,
  name_en: null,
  ...c,
});

let nextId = 1;
const item = (i: Partial<MenuItem> & { category_id: number; name: string }): MenuItem => ({
  id: nextId++,
  description: "",
  name_en: null,
  description_en: null,
  price: 9.9,
  tag: null,
  is_visible: true,
  is_available: true,
  allergens: [],
  image_path: null,
  sort_order: 1,
  ...i,
});

describe("buildPublicMenu", () => {
  it("nests subcategories under their category, and works without any", () => {
    const menu = buildPublicMenu(
      [
        cat({ id: 1, name: "Breakfast" }),
        cat({ id: 2, name: "Drinks" }),
        cat({ id: 3, name: "Coffee", parent_id: 2 }),
        cat({ id: 4, name: "Tea", parent_id: 2 }),
      ],
      [
        item({ category_id: 1, name: "Eggs Benedict", price: 13.9 }),
        item({ category_id: 3, name: "Flat White" }),
        item({ category_id: 4, name: "Earl Grey" }),
      ],
    );
    expect(menu.map((c) => c.name.text)).toEqual(["Breakfast", "Drinks"]);
    expect(menu[0]).toMatchObject({
      items: [{ name: { text: "Eggs Benedict", lang: "de" }, price: "13,90" }],
      sections: [],
    });
    expect(menu[1]!.items).toEqual([]);
    expect(menu[1]!.sections.map((s) => [s.name.text, s.items.map((i) => i.name.text)])).toEqual([
      ["Coffee", ["Flat White"]],
      ["Tea", ["Earl Grey"]],
    ]);
  });

  it("follows the display order", () => {
    const menu = buildPublicMenu(
      [cat({ id: 1, name: "B", sort_order: 2 }), cat({ id: 2, name: "A", sort_order: 1 })],
      [
        item({ category_id: 1, name: "second", sort_order: 2 }),
        item({ category_id: 1, name: "first", sort_order: 1 }),
        item({ category_id: 2, name: "x" }),
      ],
    );
    expect(menu.map((c) => c.name.text)).toEqual(["A", "B"]);
    expect(menu[1]!.items.map((i) => i.name.text)).toEqual(["first", "second"]);
  });

  it("hides unpublished dishes, categories and everything under an unpublished parent", () => {
    const menu = buildPublicMenu(
      [
        cat({ id: 1, name: "Lunch" }),
        cat({ id: 2, name: "Seasonal", is_published: false }),
        cat({ id: 3, name: "Summer", parent_id: 2 }),
        cat({ id: 4, name: "Secret", parent_id: 1, is_published: false }),
      ],
      [
        item({ category_id: 1, name: "Bowl" }),
        item({ category_id: 1, name: "Draft dish", is_visible: false }),
        item({ category_id: 2, name: "Pumpkin soup" }),
        item({ category_id: 3, name: "Gazpacho" }),
        item({ category_id: 4, name: "Hidden special" }),
      ],
    );
    expect(menu).toHaveLength(1);
    expect(menu[0]!.items.map((i) => i.name.text)).toEqual(["Bowl"]);
    expect(menu[0]!.sections).toEqual([]);
  });

  it("keeps sold-out dishes listed but marked, with allergen names and photo URL", () => {
    const [c] = buildPublicMenu(
      [cat({ id: 1, name: "Desserts" })],
      [
        item({
          category_id: 1,
          name: "Tiramisu",
          is_available: false,
          allergens: ["milk", "eggs", "gluten"],
          image_path: "items/00000000-0000-4000-8000-000000000000.webp",
          tag: "V",
        }),
      ],
    );
    expect(c!.items[0]).toMatchObject({
      available: false,
      tag: "V",
      // In the fixed EU order, not the order they were ticked.
      allergens: ["Gluten", "Eier", "Milch"],
    });
    expect(c!.items[0]!.image).toMatch(
      /\/storage\/v1\/object\/public\/menu-images\/items\/0{8}-0000-4000-8000-0{12}\.webp$/,
    );
  });

  it("drops categories that would show up empty", () => {
    const menu = buildPublicMenu(
      [cat({ id: 1, name: "Empty" }), cat({ id: 2, name: "Only hidden" })],
      [item({ category_id: 2, name: "x", is_visible: false })],
    );
    expect(menu).toEqual([]);
  });

  it("reads rows from before the hierarchy migration", () => {
    const menu = buildPublicMenu(
      [{ id: 1, name: "Breakfast", sort_order: 1 }],
      [
        {
          id: 1,
          category_id: 1,
          name: "Porridge",
          description: "",
          price: 10.9,
          tag: null,
          is_visible: true,
          sort_order: 1,
        },
      ],
    );
    expect(menu[0]!.items[0]).toMatchObject({
      name: { text: "Porridge", lang: "de" },
      available: true,
      allergens: [],
      image: null,
    });
  });

  describe("in English", () => {
    const cats = [
      cat({ id: 1, name: "Frühstück", name_en: "Breakfast" }),
      cat({ id: 2, name: "Getränke" }),
      cat({ id: 3, name: "Heiß", parent_id: 2, name_en: "  " }),
    ];
    const items = [
      item({
        category_id: 1,
        name: "Pistazien-Porridge",
        name_en: "Pistachio porridge",
        description: "Haferflocken, Pistaziencreme",
        description_en: "Oats, pistachio cream",
        price: 10.9,
        allergens: ["nuts", "milk"],
      }),
      item({
        category_id: 3,
        name: "Kardamom Latte",
        description: "Espresso, Milch, Kardamom",
        description_en: null,
      }),
    ];
    const [breakfast, drinks] = buildPublicMenu(cats, items, "en");

    it("uses the English texts, prices and allergen names", () => {
      expect(breakfast!.name).toEqual({ text: "Breakfast", lang: "en" });
      expect(breakfast!.items[0]).toMatchObject({
        name: { text: "Pistachio porridge", lang: "en" },
        desc: { text: "Oats, pistachio cream", lang: "en" },
        price: "10.90",
        allergens: ["Milk", "Tree nuts"],
      });
    });

    it("falls back to German, marked as German, when a translation is missing or blank", () => {
      expect(drinks!.name).toEqual({ text: "Getränke", lang: "de" });
      expect(drinks!.sections[0]!.name).toEqual({ text: "Heiß", lang: "de" });
      expect(drinks!.sections[0]!.items[0]).toMatchObject({
        name: { text: "Kardamom Latte", lang: "de" },
        desc: { text: "Espresso, Milch, Kardamom", lang: "de" },
      });
    });

    it("never shows English on the German site", () => {
      const [de] = buildPublicMenu(cats, items, "de");
      expect(de!.name).toEqual({ text: "Frühstück", lang: "de" });
      expect(de!.items[0]!.name.text).toBe("Pistazien-Porridge");
      expect(de!.items[0]!.allergens).toEqual(["Milch", "Schalenfrüchte"]);
    });
  });
});
