import { test, expect } from "@playwright/test";
import { loadEnvConfig } from "../../src/config/types";
import { resolveEnvName } from "../../src/config/resolveEnv";
import { OAuthTokenService } from "../../src/auth/oauthTokenService";

test("gets an access token (cached)", async () => {
  const envName = resolveEnvName();
  const cfg = loadEnvConfig(envName);

  const svc = new OAuthTokenService();
  const t1 = await svc.getAccessToken(cfg);
  const t2 = await svc.getAccessToken(cfg);

  expect(t1).toBeTruthy();
  expect(t2).toBeTruthy();
  expect(t2).toBe(t1); // should be cached and identical
  //console.log("Access Token:", t1);
});
