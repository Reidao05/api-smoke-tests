import { request, APIRequestContext } from "@playwright/test";
import type { EnvConfig } from "../config/env";

type CachedToken = {
  accessToken: string;
  // epoch ms when we should refresh (early)
  refreshAt: number;
};

export class OAuthTokenService {
  private cache = new Map<string, CachedToken>();
  private inFlight = new Map<string, Promise<string>>(); // prevents duplicate calls

  constructor(private readonly refreshSkewMs: number = 60_000) {}

  private tokenUrl(env: EnvConfig): string {
    // Azure AD v2 token endpoint pattern
    return `${env.authBaseUrl}/${env.directory}/oauth2/v2.0/token`;
  }

  private isValid(cached?: CachedToken): boolean {
    return !!cached && Date.now() < cached.refreshAt;
  }

  async getAccessToken(env: EnvConfig): Promise<string> {
    const key = env.name;
    const cached = this.cache.get(key);

    // 1) Return cached if still valid
    if (this.isValid(cached)) {
      return cached!.accessToken;
    }

    // 2) If a fetch is already happening for this env, await it
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    // 3) Start a single-flight fetch and store the Promise
    const promise = this.fetchAndCache(env)
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  private async fetchAndCache(env: EnvConfig): Promise<string> {
    const ctx = await request.newContext();

    try {
      const url = this.tokenUrl(env);

      const res = await ctx.post(url, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        form: {
            client_id: env.clientId,
            client_secret: env.secret,
            grant_type: "client_credentials",
            scope: env.scope
        },
      });

      if (!res.ok()) {
        const body = await res.text();
        throw new Error(`Token request failed (${res.status()}): ${body}`);
      }

      const json = (await res.json()) as {
        access_token: string;
        expires_in?: number; // seconds
        expires_on?: string; // sometimes present
      };

      if (!json.access_token) {
        throw new Error("Token response missing access_token");
      }

      // Prefer expires_in (seconds). Default to 1 hour if absent.
      const expiresInSec = typeof json.expires_in === "number" ? json.expires_in : 3600;
      const expiresAt = Date.now() + expiresInSec * 1000;

      // Refresh early (skew) to avoid edge-of-expiry failures mid-test
      const refreshAt = Math.max(Date.now(), expiresAt - this.refreshSkewMs);

      this.cache.set(env.name, {
        accessToken: json.access_token,
        refreshAt,
      });

      return json.access_token;
    } finally {
      await ctx.dispose();
    }
  }

  // Optional: handy for debugging
  clear(envName?: string) {
    if (envName) {
      this.cache.delete(envName);
      this.inFlight.delete(envName);
    } else {
      this.cache.clear();
      this.inFlight.clear();
    }
  }
}
