
import {test, expect } from '@playwright/test';
import { loadEnvConfig } from '../../src/config/types';
import { resolveEnvName } from '../../src/config/resolveEnv';

test('Loads All environment Config', async () => {
    const env = resolveEnvName();
    const cfg = loadEnvConfig(env);
    expect(cfg.name).toBe(env);
   // console.log("Loaded env...:", {...cfg, secret: "***"});
  //  console.log("Loaded env:", { name: cfg.name, clientId: cfg.clientId, scope: cfg.scope });
});
