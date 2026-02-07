import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { CashApplicationClient } from "../../src/clients/cashApplication.client";
import { buildCashAppImportRequest } from "../../src/payloads/cashApplication/cashAppImport.payload";
import { validateCashAppImportResponse } from "../../src/validators/cashApplication/CashAppImport.validator";
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:cashApplication", () => {
  test("Cash Application → import (smoke)", async ({ api, envCfg }, testInfo) => {
    addTestMeta(testInfo, { capability: "CashApplication", smoke: true, critical: true });

    const dns = resolveDns(envCfg);
    const client = new CashApplicationClient(api);

    await withFailureArtifacts(
      testInfo,
      async () => {
        const company = envCfg.cashApplication.delimited.company;
        const bankAccountId = envCfg.cashApplication.delimited.bankAccountId;
        const secretName = envCfg.secretName;

        const body = buildCashAppImportRequest({
          company,
          bankAccountId,
          dns,
          options: {
            ERPLogInfo: "",
            TASVersion: "",
            SecretName: "", // keep empty to use env var from config, or set to specific secret name if needed
            RuntimeUrl: "", // keep empty unless required
          },
        });

        const res = await client.import(body);

        expect(res.status).toBe(200);

        validateCashAppImportResponse(res.json);

        expect(res.json.ImportsWithErrors).toBe(0);
        expect(res.json.ImportsSucceeded).toBeGreaterThan(0);
        expect(res.json.CashAppImportSources.length).toBeGreaterThan(0);

        // Optional: ensure at least one source has headers (matches your sample behavior)
        const sourcesWithHeaders = res.json.CashAppImportSources.filter(
          (s: any) => Array.isArray(s.CashAppHeaders) && s.CashAppHeaders.length > 0
        );
        expect(sourcesWithHeaders.length).toBeGreaterThan(0);
      },
      {
        label: "CashApplicationImport",
        attachOnPass: true,
        attachResponseBody: true,
        context: () => ({
          exchange: client.getLastExchange?.() ?? null,
          env: envCfg.name,
          dns,
          company: envCfg.cashApplication.delimited.company,
          bankAccountId: envCfg.cashApplication.delimited.bankAccountId,
        }),
      }
    );
  });
});
