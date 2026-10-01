import { beforeEach, describe, expect, it, vi } from "vitest";

let secretKey = true;
const client = {
  from: () => ({
    select: async () => ({ data: [{ user_id: "owner" }, { user_id: "admin" }], error: null }),
  }),
  auth: {
    admin: {
      listUsers: async () => ({
        data: {
          users: [
            { id: "owner", email: "Owner@Example.com" },
            { id: "admin", email: "admin@example.com" },
            { id: "no-role", email: "former@example.com" },
          ],
        },
        error: null,
      }),
    },
  },
};
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => (secretKey ? client : null) }));

const { teamInboxes } = await import("./team-inboxes");

beforeEach(() => {
  secretKey = true;
  vi.unstubAllEnvs();
});

describe("teamInboxes", () => {
  it("notifies every account with a dashboard role, once each, plus configured inboxes", async () => {
    vi.stubEnv("RESERVATION_NOTIFY_EMAIL", "cafe@aurealounge.de, owner@example.com");
    expect((await teamInboxes()).sort()).toEqual([
      "admin@example.com",
      "cafe@aurealounge.de",
      "owner@example.com",
    ]);
  });

  it("falls back to the configured inboxes without the secret key", async () => {
    secretKey = false;
    vi.stubEnv("RESERVATION_NOTIFY_EMAIL", "cafe@aurealounge.de");
    expect(await teamInboxes()).toEqual(["cafe@aurealounge.de"]);
  });
});
