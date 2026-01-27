/**
 * Injects DNS into a payload object without knowing anything about env/config.
 */
export function withDns<T extends object>(payload: T, dns: string): T & { DNS: string } {
  const trimmed = (dns ?? "").trim();
  if (!trimmed) {
    throw new Error("DNS is required to inject into payload");
  }

  return { ...payload, DNS: trimmed };
}
