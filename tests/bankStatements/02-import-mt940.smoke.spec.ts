import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { BankStatementsClient } from "../../src/clients/bankStatements.client";
import { buildImportBankStatementsRequest } from "../../src/payloads/bankStatements/importBankStatements.payload";
import { validateImportBankStatementsResponse } from "../../src/validators/bankStatements/importBankStatements.validator";
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:bank-statements", () => {
    test("Bank Statements → import-MT940 (smoke)", async ({ api, envCfg }, testInfo) => {
      addTestMeta(testInfo, { capability: "Bank Statements", smoke: true, critical: true });
      const dns = resolveDns(envCfg);
      const client = new BankStatementsClient(api);

      await withFailureArtifacts(
        testInfo,
        async () => {
          const company = envCfg.bankStatements.mt940.company;
          const bankAccountId = envCfg.bankStatements.mt940.bankAccountId;
          const secretName = envCfg.secretName; // resolved from .env / variable group

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
              // keep other optional fields empty per your request body
            },
          });

          const res = await client.import(body);
          expect(res.status).toBe(200);

          validateImportBankStatementsResponse(res.json);

          expect(res.json.ImportsWithErrors).toBe(0);
          expect(res.json.ImportsSucceeded).toBeGreaterThan(0);
        },
        {
          label: "BankStatementsImport-MT940",
          attachOnPass: true,
          attachResponseBody: true,
          context: () => ({
            exchange: client.getLastExchange(),
            env: envCfg.name,
            dns,
            company: envCfg.bankStatements.mt940.company,
            bankAccountId: envCfg.bankStatements.mt940.bankAccountId,
          }),
        }
      );
    });
});