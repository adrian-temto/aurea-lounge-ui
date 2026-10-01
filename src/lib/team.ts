/** Rules for team access, shared by the server and the dashboard forms. */

/** user_metadata flag set on accounts created with a temporary password. */
export const MUST_CHANGE_PASSWORD = "must_change_password";

/** Minimum length for the password an admin chooses themselves. */
export const MIN_PASSWORD_LENGTH = 10;

export const ROLE_LABEL = { owner: "Super-Admin", admin: "Administrator" } as const;

export const NO_SECRET_KEY =
  "Der Supabase Secret Key fehlt (SUPABASE_SECRET_KEY). Ohne ihn können keine Konten angelegt oder entfernt werden.";
