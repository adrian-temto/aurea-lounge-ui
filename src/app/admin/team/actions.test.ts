import { beforeEach, describe, expect, it, vi } from "vitest";

/* In-memory user_roles / profiles and a fake Supabase auth admin API (the secret-key client). */
type Row = Record<string, unknown>;
type User = { id: string; email: string; password: string; user_metadata: Row };
let tables: Record<string, Row[]>;
let users: User[];
let createUserError: { code: string; message: string } | null;

function from(table: string) {
  let op: "select" | "insert" | "upsert" = "select";
  let payload: Row = {};
  const preds: ((r: Row) => boolean)[] = [];
  const run = () => {
    const rows = (tables[table] ??= []);
    if (op !== "select") {
      rows.push({ ...payload });
      return { data: null, error: null };
    }
    return { data: rows.filter((r) => preds.every((p) => p(r))), error: null };
  };
  const b = {
    select: () => b,
    insert: (p: Row) => ((op = "insert"), (payload = p), b),
    upsert: (p: Row) => ((op = "upsert"), (payload = p), b),
    eq: (k: string, v: unknown) => (preds.push((r) => r[k] === v), b),
    then: (ok: (v: unknown) => unknown) => Promise.resolve(run()).then(ok),
  };
  return b;
}

const client = {
  from,
  auth: {
    admin: {
      createUser: async (u: Omit<User, "id">) => {
        if (createUserError) return { data: { user: null }, error: createUserError };
        const user = { id: `00000000-0000-4000-8000-00000000000${users.length + 3}`, ...u };
        users.push(user);
        return { data: { user }, error: null };
      },
      getUserById: async (id: string) => ({
        data: { user: users.find((u) => u.id === id) ?? null },
      }),
      updateUserById: async (id: string, p: { password: string }) => {
        users.find((u) => u.id === id)!.password = p.password;
        return { error: null };
      },
      deleteUser: async (id: string) => {
        users = users.filter((u) => u.id !== id);
        tables["user_roles"] = tables["user_roles"]!.filter((r) => r["user_id"] !== id);
        return { error: null };
      },
    },
  },
};

let isOwner = true;
let secretKey = true;
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
let host = "admin.localhost:3000";
vi.mock("next/headers", () => ({ headers: async () => new Headers({ host }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => (secretKey ? client : null) }));
const sendEmail = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email/send", () => ({ sendEmail }));
vi.mock("@/lib/auth", () => ({
  getSession: async () => ({
    user: { id: OWNER, email: "owner@example.com" },
    isOwner,
    mustChangePassword: false,
  }),
}));

const OWNER = "11111111-1111-4111-8111-111111111111";
const ADMIN = "22222222-2222-4222-8222-222222222222";

const actions = await import("./actions");
const lastMail = () => sendEmail.mock.calls.at(-1)![0] as { to: string; text: string };

beforeEach(() => {
  isOwner = true;
  secretKey = true;
  host = "admin.localhost:3000";
  createUserError = null;
  users = [
    {
      id: ADMIN,
      email: "max@example.com",
      password: "old",
      user_metadata: { must_change_password: true },
    },
  ];
  tables = {
    user_roles: [
      { user_id: OWNER, role: "owner" },
      { user_id: ADMIN, role: "admin" },
    ],
    profiles: [],
  };
  sendEmail.mockReset().mockResolvedValue({ ok: true, id: "e1" });
});

describe("createAdmin", () => {
  it("creates an admin with a temporary password and emails the login details", async () => {
    expect(await actions.createAdmin({ name: " Lena Berg ", email: " Lena@Example.com " })).toEqual(
      {},
    );

    const user = users.at(-1)!;
    expect(user.email).toBe("lena@example.com");
    expect(user.user_metadata).toEqual({ full_name: "Lena Berg", must_change_password: true });
    expect(user.password).toMatch(/^[A-Za-z2-9]{4}-[A-Za-z2-9]{4}-[A-Za-z2-9]{4}$/);
    expect(tables["user_roles"]).toContainEqual({ user_id: user.id, role: "admin" });
    expect(lastMail().to).toBe("lena@example.com");
    expect(lastMail().text).toContain(user.password);
    expect(lastMail().text).toContain("http://admin.localhost:3000/login");
  });

  it("links to the live admin address when the request host isn't an admin host", async () => {
    host = "evil.example.com";
    await actions.createAdmin({ name: "", email: "lena@example.com" });
    expect(lastMail().text).toContain("https://admin.aurealounge.de/login");
    expect(lastMail().text).not.toContain("evil");
  });

  it("works without a name", async () => {
    expect(await actions.createAdmin({ name: "", email: "lena@example.com" })).toEqual({});
    expect(users.at(-1)!.user_metadata).toEqual({ must_change_password: true });
    expect(lastMail().text).toMatch(/^Hallo,/);
  });

  it("removes the account again when the email can't be sent", async () => {
    sendEmail.mockResolvedValue({ ok: false, error: "Resend down" });
    const res = await actions.createAdmin({ name: "Lena", email: "lena@example.com" });
    expect(res.error).toMatch(/Resend down/);
    expect(users.map((u) => u.email)).toEqual(["max@example.com"]);
    expect(tables["user_roles"]).toHaveLength(2);
  });

  it("explains an email that already has an account", async () => {
    createUserError = { code: "email_exists", message: "exists" };
    expect((await actions.createAdmin({ name: "", email: "max@example.com" })).error).toMatch(
      /schon ein Konto/,
    );
  });

  it("rejects an invalid email", async () => {
    expect((await actions.createAdmin({ name: "", email: "nope" })).error).toMatch(/E-Mail/);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("explains a missing secret key", async () => {
    secretKey = false;
    expect((await actions.createAdmin({ name: "", email: "a@b.de" })).error).toMatch(
      /SUPABASE_SECRET_KEY/,
    );
  });
});

describe("only the super admin", () => {
  it("can create, resend or remove", async () => {
    isOwner = false;
    expect((await actions.createAdmin({ name: "", email: "a@b.de" })).error).toMatch(/Super-Admin/);
    expect((await actions.resendLogin(ADMIN)).error).toMatch(/Super-Admin/);
    expect((await actions.removeAdmin(ADMIN)).error).toMatch(/Super-Admin/);
    expect(users).toHaveLength(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("resendLogin", () => {
  it("sets a new temporary password and emails it", async () => {
    expect(await actions.resendLogin(ADMIN)).toEqual({});
    const pw = users[0]!.password;
    expect(pw).not.toBe("old");
    expect(lastMail().text).toContain(pw);
  });

  it("refuses once the admin has their own password", async () => {
    users[0]!.user_metadata = {};
    expect((await actions.resendLogin(ADMIN)).error).toMatch(/eigenes Passwort/);
    expect(users[0]!.password).toBe("old");
  });
});

describe("removeAdmin", () => {
  it("deletes an admin's account", async () => {
    expect(await actions.removeAdmin(ADMIN)).toEqual({});
    expect(users).toHaveLength(0);
  });

  it("never removes the super admin", async () => {
    expect((await actions.removeAdmin(OWNER)).error).toMatch(/eigenen Zugang/);
    tables["user_roles"]!.push({ user_id: "33333333-3333-4333-8333-333333333333", role: "owner" });
    expect((await actions.removeAdmin("33333333-3333-4333-8333-333333333333")).error).toMatch(
      /Super-Admin kann nicht/,
    );
  });
});
