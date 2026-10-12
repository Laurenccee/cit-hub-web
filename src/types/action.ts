/**
 * Shared result contracts for server actions.
 *
 * Mutations return `ActionResult`; reads return `QueryResult<T>`. Keeping both
 * in one place means every feature speaks the same shape to its callers instead
 * of redeclaring ad-hoc `{ success, message }` / `{ success, data }` objects.
 */

/** The failure branch shared by every server action. */
export interface ActionFailure {
    success: false;
    message: string;
    /** Zod issues keyed by form field name, so forms can render them inline. */
    fieldErrors?: Record<string, string[]>;
}

/**
 * Result of a mutating server action.
 *
 * `TExtra` carries any additional fields returned on success (for example
 * `{ eventId }`). The default, `{}`, means the action returns no extra payload.
 */
export type ActionResult<TExtra = Record<never, never>> =
    | ({ success: true; message?: string } & Partial<TExtra>)
    | ActionFailure;

/** Result of a read/query action that returns a `data` payload. */
export interface QueryResult<T> {
    success: boolean;
    data: T;
}

/** Result of an image/storage upload action. */
export type UploadActionResult = ActionResult<{ url?: string }>;
