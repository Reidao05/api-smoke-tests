import type { TestInfo } from "@playwright/test";

type AnyObj = Record<string, any>;

export type FailureArtifactOptions = {
  /** Used for naming attachments */
  label?: string;

  /** Mask these keys anywhere in nested JSON (case-insensitive match). */
  maskKeys?: string[];

  /** If your API client stores last request/response here, pass it in. */
  context?: AnyObj;

  /** Additional debug data you want attached on failure. */
  extras?: AnyObj;
};

const DEFAULT_MASK_KEYS = [
  "authorization",
  "token",
  "access_token",
  "refresh_token",
  "clientsecret",
  "secret",
  "password",
  "pin",
  "apikey",
  "api_key",
  "ssn",
];

export async function withFailureArtifacts(
  testInfo: TestInfo,
  action: () => Promise<void>,
  options: FailureArtifactOptions = {}
): Promise<void> {
  const startedAt = Date.now();
  const label = options.label ?? "failure-artifacts";
  const maskKeys = options.maskKeys ?? DEFAULT_MASK_KEYS;

  try {
    await action();
  } catch (err: any) {
    const durationMs = Date.now() - startedAt;

    const safeContext = options.context ? maskDeep(options.context, maskKeys) : undefined;
    const safeExtras = options.extras ? maskDeep(options.extras, maskKeys) : undefined;

    const payload: AnyObj = {
      label,
      durationMs,
      error: {
        name: err?.name,
        message: err?.message ?? String(err),
        stack: err?.stack,
      },
      context: safeContext,
      extras: safeExtras,
    };

    // Attach a single JSON “bundle” so it’s easy to find in HTML report + CI artifacts.
    await testInfo.attach(`${label}.json`, {
      body: Buffer.from(JSON.stringify(payload, null, 2), "utf-8"),
      contentType: "application/json",
    });

    // Optional: also attach a plain text quick-glance
    await testInfo.attach(`${label}.txt`, {
      body: Buffer.from(formatQuickLook(payload), "utf-8"),
      contentType: "text/plain",
    });

    throw err;
  }
}

function maskDeep(input: any, maskKeys: string[]): any {
  if (input === null || input === undefined) return input;

  if (Array.isArray(input)) return input.map((v) => maskDeep(v, maskKeys));

  if (typeof input === "object") {
    const out: AnyObj = {};
    for (const [k, v] of Object.entries(input)) {
      if (shouldMaskKey(k, maskKeys)) {
        out[k] = "****";
      } else {
        out[k] = maskDeep(v, maskKeys);
      }
    }
    return out;
  }

  return input;
}

function shouldMaskKey(key: string, maskKeys: string[]): boolean {
  const k = key.toLowerCase();
  return maskKeys.some((mk) => mk.toLowerCase() === k);
}

function formatQuickLook(bundle: AnyObj): string {
  const lines: string[] = [];
  lines.push(`Label: ${bundle.label}`);
  lines.push(`Duration: ${bundle.durationMs} ms`);
  lines.push(`Error: ${bundle.error?.name ?? ""} - ${bundle.error?.message ?? ""}`);
  lines.push("");
  if (bundle.context) {
    lines.push("Context keys:");
    lines.push(Object.keys(bundle.context).join(", "));
    lines.push("");
  }
  return lines.join("\n");
}
