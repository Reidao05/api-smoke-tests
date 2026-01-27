import type { EnvConfig } from "../config/env";

export function resolveDns(env: EnvConfig): string {
  const raw = process.env.DNS_TARGET;

  const dns =
    typeof raw === "string"
      ? raw.trim()
      : env.dns.trim();

  if (!dns) {
    throw new Error(`DNS is not configured for env ${env.name}`);
  }

  return dns;
}

export function withDns<T extends object>(payload: T, dns: string) {
  return { ...payload, DNS: dns };
}
