import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { BankStatementsClient } from "../../src/clients/bankStatements.client";
import { buildImportBankStatementsRequest } from "../../src/payloads/bankStatements/importBankStatements.payload";
import { validateImportBankStatementsResponse } from "../../src/validators/bankStatements/importBankStatements.validator";
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:bank-statements", () => {
    test("Bank Statements → import BC (smoke)", async ({ api, envCfg }, testInfo) => {
      addTestMeta(testInfo, { capability: "bank-statements", smoke: true, critical: true });
      const dns = resolveDns(envCfg);
      const client = new BankStatementsClient(api);

      // Resolve required values from env vars (configured by env.<env>.json via loadEnvConfig)
      // If you already have these in envCfg, use envCfg.<field> instead.
      const company = envCfg.bankStatements.bai2.company;
      const bankAccountId = envCfg.bankStatements.bai2.bankAccountId;
      const secretName = envCfg.secretName; // already resolved from .env

      await withFailureArtifacts(
        testInfo,
        async () => {
          if (!company || !bankAccountId || !secretName) {
            throw new Error("Missing COMPANY_BAI2 / BANKACCOUNTID_BAI2 / SECRET_NAME env vars");
          }

          const body = buildImportBankStatementsRequest({
            company,
            bankAccountId,
            fromDate: "2022-11-01",
            toDate: "2023-11-02",
            dns,
            secretName,
            options: {
              RuntimeUrl: "string",
              TASVersion: "",
              ERPLogInfo: "",
            },
          });

          const res = await client.import(body);
          expect(res.status).toBe(200);

          validateImportBankStatementsResponse(res.json);

          // Smoke expectation: no errors
          expect(res.json.ImportsWithErrors).toBe(0);
          expect(res.json.ImportsSucceeded).toBeGreaterThan(0);
        },
        {
          label: "BankStatementsImport",
          attachOnPass: true,
          attachResponseBody: true,
          context: () => ({
            exchange: client.getLastExchange(),
            env: envCfg.name,
            dns,
          }),
          // Your masking already includes "secret" / "secretname" so NewSecret/NewSecretName will be masked.
        }
      );
    });
  });