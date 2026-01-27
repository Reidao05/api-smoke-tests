// src/utils/response.utils.ts

/**
 * Safely parse a response body to JSON.
 * Throws a descriptive error if parsing fails.
 */
export function parseJsonOrThrow(
  text: string,
  context?: { status?: number; hint?: string }
): any {
  try {
    return JSON.parse(text);
  } catch {
    const meta = [
      context?.status ? `Status=${context.status}` : undefined,
      context?.hint ? context.hint : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    throw new Error(
      `Response was not valid JSON${meta ? ` (${meta})` : ""}\nBody=${text}`
    );
  }
}

/**
 * Normalize unknown response fields that may be string | object | null.
 * Useful for Message / FailReason inconsistencies.
 */
export function isStringObjectOrNull(value: unknown): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "object"
  );
}
