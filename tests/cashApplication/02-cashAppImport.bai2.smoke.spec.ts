import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { CashApplicationClient } from "../../src/clients/cashApplication.client";
import { buildCashAppImportRequest } from "../../src/payloads/cashApplication/cashAppImport.payload";
import { validateCashAppImportResponse } from "../../src/validators/cashApplication/CashAppImport.validator";
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:cashApplication", () => {
  test("Cash Application → import BAI2 (smoke)", async ({ api, envCfg }, testInfo) => {
    addTestMeta(testInfo, { capability: "CashApplication", smoke: true, critical: true });

    const dns = resolveDns(envCfg);
    const client = new CashApplicationClient(api);

    await withFailureArtifacts(
      testInfo,
      async () => {
        const company = envCfg.cashApplication.bai2.company;
        const bankAccountId = envCfg.cashApplication.bai2.bankAccountId;

        const body = buildCashAppImportRequest({
          company,
          bankAccountId,
          dns,
          options: {
            ERPLogInfo: "",
            TASVersion: "",
            SecretName: "",   // per your request
            RuntimeUrl: "",
          },
        });

        const res = await client.import(body);

        expect(res.status).toBe(200);
        validateCashAppImportResponse(res.json);

        expect(res.json.ImportsWithErrors).toBe(0);
        // If BAI2 sometimes imports 0 depending on files present, loosen this to >= 0
        expect(res.json.ImportsSucceeded).toBeGreaterThan(0);
      },
      {
        label: "CashApplicationImport-BAI2",
        attachOnPass: true,
        attachResponseBody: true,
        context: () => ({
          exchange: client.getLastExchange?.() ?? null,
          env: envCfg.name,
          dns,
          company: envCfg.cashApplication.bai2.company,
          bankAccountId: envCfg.cashApplication.bai2.bankAccountId,
          fileType: "BAI2",
        }),
      }
    );
  });
});
