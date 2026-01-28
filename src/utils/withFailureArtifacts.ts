// src/utils/withFailureArtifacts.ts
import type { TestInfo } from "@playwright/test";

type AnyObj = Record<string, any>;

export type FailureArtifactsOptions = {
  label?: string;
  maskKeys?: string[];
  context?: AnyObj | (() => AnyObj);
  attachOnPass?: boolean;
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
  const startedAt = Date.now();

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
    const durationMs = Date.now() - startedAt;

    const bundle: AnyObj = {
      label,
      env: process.env.ENV ?? "unknown",
      outcome,
      durationMs,
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
    if (attachOnPass) await attachBundle("pass");
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
      out[k] = shouldMaskKey(k, maskKeys) ? "****" : maskDeep(v, maskKeys);
    }
    return out;
  }

  return input;
}

function shouldMaskKey(key: string, maskKeys: string[]): boolean {
  const k = key.toLowerCase();
  return maskKeys.some((mk) => mk.toLowerCase() === k);
}
