// src/utils/withFailureArtifacts.ts
import type { TestInfo } from "@playwright/test";

type AnyObj = Record<string, any>;

export type FailureArtifactsOptions = {
  /** Used for naming attachments */
  label?: string;

  /** Keys to mask anywhere in nested JSON (case-insensitive match). */
  maskKeys?: string[];

  /**
   * Context to attach.
   * IMPORTANT: Prefer a function so it runs AFTER the API call (e.g., client.getLastExchange()).
   */
  context?: AnyObj | (() => AnyObj);

  /**
   * Attach artifacts even when the test passes.
   * If not set, you can enable pass-attachments with env var DEBUG_API=1.
   */
  attachOnPass?: boolean;

  /**
   * When attaching on pass/fail, also attach a standalone file containing ONLY the response body
   * (if it exists at context.exchange.response.body).
   */
  attachResponseBody?: boolean;
};

const DEFAULT_MASK_KEYS = [
  "authorization",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "clientsecret",
  "password",
  "pin",
  "apikey",
  "api_key",
];

export async function withFailureArtifacts(
  testInfo: TestInfo,
  action: () => Promise<void>,
  options: FailureArtifactsOptions = {}
): Promise<void> {
  const label = options.label ?? "failure-artifacts";
  const maskKeys = options.maskKeys ?? DEFAULT_MASK_KEYS;

  const attachOnPass = options.attachOnPass === true || process.env.DEBUG_API === "1";
  const attachResponseBody = options.attachResponseBody === true;

  const resolveRawContext = (): AnyObj | undefined => {
    if (!options.context) return undefined;
    return typeof options.context === "function" ? options.context() : options.context;
  };

  const resolveMaskedContext = (): AnyObj | undefined => {
    const raw = resolveRawContext();
    return raw ? maskDeep(raw, maskKeys) : undefined;
  };

  const getResponseBodyFromContext = (ctx: AnyObj | undefined): any => {
    // Convention: ctx.exchange.response.body
    return ctx?.exchange?.response?.body;
  };

  const attachJson = async (name: string, payload: any): Promise<void> => {
    await testInfo.attach(name, {
      body: Buffer.from(JSON.stringify(payload, null, 2), "utf-8"),
      contentType: "application/json",
    });
  };

  const attachBundle = async (outcome: "pass" | "fail", error?: any): Promise<void> => {
    const maskedContext = resolveMaskedContext();

    const bundle: AnyObj = {
      label,
      env: process.env.ENV,
      outcome,
      error: error
        ? {
            name: error?.name,
            message: error?.message ?? String(error),
            stack: error?.stack,
          }
        : undefined,
      context: maskedContext,
    };

    await attachJson(`${label}.${outcome}.json`, bundle);

    if (attachResponseBody) {
      const responseBody = getResponseBodyFromContext(maskedContext);
      if (responseBody !== undefined) {
        await attachJson(`${label}.${outcome}.response.json`, responseBody);
      }
    }
  };

  try {
    await action();

    if (attachOnPass) {
      await attachBundle("pass");
    }
  } catch (err: any) {
    await attachBundle("fail", err);
    throw err;
  }
}

function maskDeep(input: any, maskKeys: string[]): any {
  if (input === null || input === undefined) return input;

  if (Array.isArray(input)) return input.map((v) => maskDeep(v, maskKeys));

  if (typeof input === "object") {
    const out: AnyObj = {};
    for (const [k, v] of Object.entries(input)) {
      if (shouldMaskKey(k, maskKeys)) out[k] = "****";
      else out[k] = maskDeep(v, maskKeys);
    }
    return out;
  }

  return input;
}

function shouldMaskKey(key: string, maskKeys: string[]): boolean {
  const k = key.toLowerCase();
  return maskKeys.some((mk) => mk.toLowerCase() === k);
}
