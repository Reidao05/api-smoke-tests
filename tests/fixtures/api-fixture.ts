import { APIRequestContext } from '@playwright/test';
import {test as base, request} from '@playwright/test';
import { loadEnvConfig } from '../../src/config/env';
import { resolveEnvName } from '../../src/config/resolveEnv';
import { OAuthTokenService } from '../../src/api/oauthTokenService';

type Fixtures ={
    envCfg: ReturnType<typeof loadEnvConfig>;
    token: string;
    api: APIRequestContext;
};

export const test = base.extend<Fixtures>({
    envCfg: async ({}, use) => {
        const envName = resolveEnvName();
        const cfg = loadEnvConfig(envName);
        await use(cfg);
    },

    token: async ({ envCfg }, use) => {
        const svc = new OAuthTokenService();
        const token = await svc.getAccessToken(envCfg);
        await use(token);
    },

    api: async ({ token, envCfg }, use) => {
        const api = await request.newContext({

            baseURL: envCfg.baseUrl,
            extraHTTPHeaders: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'  
            }
        });
        await use(api);
    }
});
export { expect } from "@playwright/test";