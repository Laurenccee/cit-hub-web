/**
 * Extracts a human-readable message from an unknown thrown value,
 * falling back to a provided default when it is not an `Error`.
 */
export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
