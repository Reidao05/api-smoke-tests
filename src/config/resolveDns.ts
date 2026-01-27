import type { EnvConfig } from "./types";

/**
 * Resolve the DNS target for the current run.
 * Priority:
 *  1) process.env.DNS_TARGET (trimmed)
 *  2) env.dns from env.<ENV>.json (trimmed)
 */
export function resolveDns(env: EnvConfig): string {
  const raw = process.env.DNS_TARGET;

  const dns =
    typeof raw === "string" && raw.trim().length > 0
      ? raw.trim()
      : (env.dns ?? "").trim();

  if (!dns) {
    throw new Error(`DNS is not configured for env ${env.name}`);
  }

  return dns;
}
