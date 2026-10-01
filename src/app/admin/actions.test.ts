import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Permission } from "@/lib/types";

/* A tiny in-memory stand-in for the Supabase query builder: enough for the menu and reservation actions. */
type Row = Record<string, unknown>;
type Write = { table: string; op: "insert" | "update" | "delete"; payload?: Row; where: Row };

function fakeSupabase(tables: Record<string, Row[]>) {
  const writes: Write[] = [];
  const from = vi.fn((table: string) => {
    let op: "select" | Write["op"] = "select";
    let payload: Row | undefined;
    const where: Row = {};
    const preds: ((r: Row) => boolean)[] = [];
    let head = false;
    const result = () => {
      if (op !== "select") {
        writes.push({ table, op, where, ...(payload ? { payload } : {}) });
        return { data: null, error: null };
      }
      const rows = (tables[table] ?? []).filter((r) => preds.every((p) => p(r)));
      return { data: head ? null : rows, count: rows.length, error: null };
    };
    const b = {
      select: (_c?: string, opts?: { head?: boolean }) => ((head = !!opts?.head), b),
      insert: (p: Row) => ((op = "insert"), (payload = p), b),
      update: (p: Row) => ((op = "update"), (payload = p), b),
      delete: () => ((op = "delete"), b),
      eq: (k: string, v: unknown) => ((where[k] = v), preds.push((r) => r[k] === v), b),
      in: (k: string, v: unknown[]) => ((where[k] = v), preds.push((r) => v.includes(r[k])), b),
      is: (k: string, v: unknown) => (preds.push((r) => (r[k] ?? null) === v), b),
      not: () => b,
      order: () => b,
      limit: () => b,
      // update(…).select().single(): applies the update in memory and returns the row.
      single: () => {
        const rows = (tables[table] ?? []).filter((r) => preds.every((p) => p(r)));
        if (op === "update" && payload) {
          writes.push({ table, op, where, payload });
          rows.forEach((r) => Object.assign(r, payload));
        }
        return Promise.resolve({ data: rows[0] ?? null, error: rows[0] ? null : { message: "not found" } });
      },
      maybeSingle: () => {
        const r = result();
        return Promise.resolve({ ...r, data: Array.isArray(r.data) ? (r.data[0] ?? null) : null });
      },
      then: (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) =>
        Promise.resolve(result()).then(ok, fail),
    };
    return b;
  });
  const remove = vi.fn(async () => ({ error: null }));
  const rpc = vi.fn(async () => ({ data: 2, error: null }));
  return { client: { from, rpc, storage: { from: () => ({ remove }) } }, from, rpc, writes, remove };
}

let db: ReturnType<typeof fakeSupabase>;
let permissions: Permission[] = [];

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const sendEmail = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email/send", () => ({ sendEmail, replyToAddress: () => "team@aurealounge.de" }));
vi.mock("@/lib/auth", () => ({
  getSession: async () => ({
    user: permissions.length ? { id: "u1", email: "a@b.de" } : null,
    permissions,
    supabase: db.client,
  }),
}));

const actions = await import("./actions");

const reservation = {
  name: "Mia Weber",
  phone: "+49 170 1234567",
  email: "mia@example.com",
  reservation_date: "2026-10-10",
  reservation_time: "19:00:00",
  guests: 2,
  special_requests: null,
  status: "new",
  locale: "de",
  admin_response: null,
  response_emailed_at: null,
};

const validItem = {
  category_id: 1,
  name: "Pistazien-Tiramisu",
  description: "Mascarpone, Espresso, Pistazie",
  name_en: null,
  description_en: null,
  price: "8,50",
  tag: null,
  allergens: ["milk", "eggs", "milk"],
  image_path: null,
  is_visible: true,
  is_available: true,
  sort_order: 3,
};

beforeEach(() => {
  permissions = ["menu.manage"];
  db = fakeSupabase({
    menu_categories: [
      { id: 1, parent_id: null, sort_order: 1 },
      { id: 2, parent_id: null, sort_order: 2 },
      { id: 3, parent_id: 2, sort_order: 1 },
    ],
    menu_items: [
      { id: 10, category_id: 1, image_path: null },
      { id: 11, category_id: 1, image_path: "items/11111111-1111-4111-8111-111111111111.jpg" },
      { id: 12, category_id: 3, image_path: null },
    ],
    reservations: [
      { ...reservation, id: 20 },
      { ...reservation, id: 21, email: null },
      { ...reservation, id: 22, locale: "en", name: "Jane Doe", email: "jane@example.com" },
    ],
  });
  sendEmail.mockReset().mockResolvedValue({ ok: true, id: "email-1" });
});

describe("authorization", () => {
  it.each<[string, () => Promise<{ error?: string }>]>([
    [
      "saveCategory",
      () => actions.saveCategory(null, { name: "X", name_en: null, parent_id: null, is_published: true }),
    ],
    ["setCategoryPublished", () => actions.setCategoryPublished(1, false)],
    ["deleteCategory", () => actions.deleteCategory(1)],
    ["reorderCategories", () => actions.reorderCategories([2, 1])],
    ["saveMenuItem", () => actions.saveMenuItem(null, validItem)],
    ["setMenuItemFlags", () => actions.setMenuItemFlags(10, { is_visible: false })],
    ["reorderMenuItems", () => actions.reorderMenuItems([11, 10])],
    ["deleteMenuItem", () => actions.deleteMenuItem(10)],
  ])("%s refuses staff without menu.manage before touching the database", async (_, call) => {
    permissions = ["reservations.manage"];
    expect(await call()).toEqual({ error: "Dafür fehlt dir die Berechtigung." });
    expect(db.from).not.toHaveBeenCalled();
  });

  it("refuses visitors who are not signed in", async () => {
    permissions = [];
    expect((await actions.deleteMenuItem(10)).error).toMatch(/Berechtigung/);
    expect(db.from).not.toHaveBeenCalled();
  });
});

describe("dishes", () => {
  it("stores the price as a number and each allergen once", async () => {
    expect(await actions.saveMenuItem(null, validItem)).toEqual({});
    expect(db.writes).toEqual([
      {
        table: "menu_items",
        op: "insert",
        where: {},
        payload: expect.objectContaining({ price: 8.5, allergens: ["milk", "eggs"] }),
      },
    ]);
  });

  it.each([
    ["a price with three decimals", { price: "8,505" }, /Format 13,90/],
    ["a negative price", { price: "-2" }, /Format 13,90/],
    ["an unknown allergen", { allergens: ["bacon"] }, /./],
    ["an image outside the bucket folder", { image_path: "../secrets.png" }, /Ungültiges Bild/],
    ["an empty name", { name: "  " }, /Name fehlt/],
  ])("rejects %s", async (_, patch, message) => {
    const res = await actions.saveMenuItem(10, { ...validItem, ...patch } as typeof validItem);
    expect(res.error).toMatch(message);
    expect(db.writes).toEqual([]);
  });

  it("removes the old photo once a dish points to a new one", async () => {
    const next = "items/22222222-2222-4222-8222-222222222222.png";
    expect(await actions.saveMenuItem(11, { ...validItem, image_path: next })).toEqual({});
    expect(db.remove).toHaveBeenCalledWith(["items/11111111-1111-4111-8111-111111111111.jpg"]);
  });

  it("unpublishes and marks sold out through flags only", async () => {
    await actions.setMenuItemFlags(10, { is_visible: false });
    await actions.setMenuItemFlags(10, { is_available: false });
    expect(db.writes.map((w) => w.payload)).toEqual([
      { is_visible: false },
      { is_available: false },
    ]);
    expect(
      (await actions.setMenuItemFlags(10, { price: 0 } as unknown as { is_visible: boolean }))
        .error,
    ).toBeTruthy();
  });
});

describe("order", () => {
  it("renumbers dishes in the given order", async () => {
    expect(await actions.reorderMenuItems([11, 10])).toEqual({});
    expect(db.writes.map((w) => [w.where["id"], w.payload])).toEqual([
      [11, { sort_order: 1 }],
      [10, { sort_order: 2 }],
    ]);
  });

  it("refuses to mix dishes from different categories", async () => {
    expect((await actions.reorderMenuItems([10, 12])).error).toMatch(/selben Gruppe/);
    expect(db.writes).toEqual([]);
  });

  it("refuses to mix categories with subcategories", async () => {
    expect((await actions.reorderCategories([1, 3])).error).toMatch(/selben Gruppe/);
    expect(db.writes).toEqual([]);
  });
});

describe("categories", () => {
  it("adds a subcategory at the end of its siblings", async () => {
    expect(
      await actions.saveCategory(null, { name: " Tee ", name_en: null, parent_id: 2, is_published: true }),
    ).toEqual({});
    expect(db.writes.at(-1)).toMatchObject({
      op: "insert",
      payload: { name: "Tee", parent_id: 2, is_published: true, sort_order: 2 },
    });
  });

  it("allows only one level of subcategories", async () => {
    const res = await actions.saveCategory(null, {
      name: "Deep",
      name_en: null,
      parent_id: 3,
      is_published: true,
    });
    expect(res.error).toMatch(/keine eigenen Unterkategorien/);
    const moveParent = await actions.saveCategory(2, {
      name: "Drinks",
      name_en: null,
      parent_id: 1,
      is_published: true,
    });
    expect(moveParent.error).toMatch(/hat Unterkategorien/);
    expect(db.writes).toEqual([]);
  });

  it("deletes a category and cleans up its dishes' photos", async () => {
    expect(await actions.deleteCategory(1)).toEqual({});
    expect(db.writes).toEqual([{ table: "menu_categories", op: "delete", where: { id: 1 } }]);
    expect(db.remove).toHaveBeenCalledWith(["items/11111111-1111-4111-8111-111111111111.jpg"]);
  });
});

describe("reservation answers", () => {
  beforeEach(() => {
    permissions = ["reservations.manage"];
  });

  it("saves the answer and emails it to the guest", async () => {
    const res = await actions.respondToReservation(20, "confirmed", "Hallo Mia, bis bald!");
    expect(res.delivery).toEqual({ emailed: true });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const email = sendEmail.mock.calls[0]![0];
    expect(email.to).toBe("mia@example.com");
    expect(email.subject).toBe("Deine Reservierung bei Auréa ist bestätigt");
    expect(email.text).toContain("Hallo Mia, bis bald!");
    expect(email.replyTo).toBe("team@aurealounge.de");
    expect(res.reservation?.status).toBe("confirmed");
    expect(res.reservation?.response_emailed_at).toBeTruthy();
  });

  it("writes to guests who booked in English in English", async () => {
    await actions.respondToReservation(22, "declined", "Sorry, we are full.");
    expect(sendEmail.mock.calls[0]![0].subject).toBe("About your reservation request at Auréa");
  });

  it("only saves when the team unticks the email", async () => {
    const res = await actions.respondToReservation(20, "confirmed", "Bis bald!", false);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(res.delivery?.emailed).toBe(false);
    expect(res.reservation?.response_emailed_at).toBeNull();
  });

  it("keeps the answer when there is no address or the email fails", async () => {
    const noAddress = await actions.respondToReservation(21, "confirmed", "Bis bald!");
    expect(noAddress.delivery).toEqual({ emailed: false, reason: expect.stringMatching(/keine E-Mail-Adresse/) });

    sendEmail.mockResolvedValue({ ok: false, error: "Resend antwortete mit 500." });
    const failed = await actions.respondToReservation(20, "confirmed", "Bis bald!");
    expect(failed.error).toBeUndefined();
    expect(failed.delivery).toEqual({ emailed: false, reason: "Resend antwortete mit 500." });
    expect(failed.reservation?.admin_response).toBe("Bis bald!");
  });

  it("refuses staff without reservations.manage", async () => {
    permissions = ["menu.manage"];
    expect((await actions.respondToReservation(20, "confirmed", "Hi")).error).toMatch(/Berechtigung/);
    expect((await actions.eraseGuestData("mia@example.com", "")).error).toMatch(/Berechtigung/);
    expect((await actions.deleteReservation(20)).error).toMatch(/Berechtigung/);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(db.from).not.toHaveBeenCalled();
    expect(db.rpc).not.toHaveBeenCalled();
  });
});

describe("guest data erasure", () => {
  beforeEach(() => {
    permissions = ["reservations.manage"];
  });

  it("erases by email or phone and reports how many reservations went", async () => {
    expect(await actions.eraseGuestData("  Mia@Example.com ", "")).toEqual({ deleted: 2 });
    expect(db.rpc).toHaveBeenCalledWith("erase_guest_data", { p_email: "mia@example.com", p_phone: "" });
  });

  it("needs an email address or a phone number", async () => {
    expect((await actions.eraseGuestData("", "12")).error).toMatch(/E-Mail-Adresse oder Telefonnummer/);
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("deletes a single reservation", async () => {
    expect(await actions.deleteReservation(20)).toEqual({});
    expect(db.writes).toEqual([{ table: "reservations", op: "delete", where: { id: 20 } }]);
  });
});
