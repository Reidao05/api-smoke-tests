// src/payloads/assistedSetup.payload.ts

export type WebApiListPayload = {
  Purpose_AP: boolean;
  Purpose_APStatus: boolean;
  Purpose_BankStatements: boolean;
};

/**
 * Default payload for /api/assistedsetup/webapilist
 * Keeps tests and clients clean.
 */
export function defaultWebApiListPayload(): WebApiListPayload {
  return {
    Purpose_AP: true,
    Purpose_APStatus: false,
    Purpose_BankStatements: false,
  };
}

/**
 * Optional helper if you ever need overrides
 * without rebuilding the payload in tests.
 */
export function buildWebApiListPayload(
  overrides?: Partial<WebApiListPayload>
): WebApiListPayload {
  return {
    ...defaultWebApiListPayload(),
    ...overrides,
  };
}
