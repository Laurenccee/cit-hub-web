type SafeParse = { safeParse: (value: unknown) => unknown };

type ParseResult = {
  success: boolean;
  data?: unknown;
  error?: { issues: { path: PropertyKey[]; message: string; code: string }[] };
};

/**
 * Summarizes a schema's answer for snapshot tests: parsed data on success,
 * otherwise one `path: message [code]` line per issue, so a schema refactor
 * cannot silently change which field fails or what the user is told.
 */
export function reportParse(schema: SafeParse, input: unknown) {
  const result = schema.safeParse(input) as ParseResult;
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error!.issues.map((issue) => `${issue.path.join(".")}: ${issue.message} [${issue.code}]`),
  };
}
