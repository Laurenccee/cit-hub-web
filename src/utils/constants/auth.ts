/**
 * Default password assigned to admin-created ("pre-registered") accounts.
 * Users are flagged with `change_password: true` and must reset it on first sign-in.
 *
 * Overridable via the server-only `DEFAULT_TEMP_PASSWORD` env var.
 */
export const DEFAULT_TEMP_PASSWORD =
  process.env.DEFAULT_TEMP_PASSWORD ?? "P@ssw0rd!";
