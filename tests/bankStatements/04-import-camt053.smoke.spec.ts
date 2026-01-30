import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { BankStatementsClient } from "../../src/clients/bankStatements.client";
import { buildImportBankStatementsRequest } from "../../src/payloads/bankStatements/importBankStatements.payload";
import { validateImportBankStatementsResponse } from "../../src/validators/bankStatements/importBankStatements.validator";
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:bank-statements", () => {
  test("Bank Statements → import-CAMT053 (smoke)", async ({ api, envCfg }, testInfo) => {
    addTestMeta(testInfo, { capability: "bank-statements", smoke: true, critical: true });

    const dns = resolveDns(envCfg);
    const client = new BankStatementsClient(api);

    await withFailureArtifacts(
      testInfo,
      async () => {
        const company = envCfg.bankStatements.camt053.company;
        const bankAccountId = envCfg.bankStatements.camt053.bankAccountId;
        const accountNumber = envCfg.bankStatements.camt053.accountNumber;
        const secretName = envCfg.secretName;

        const body = buildImportBankStatementsRequest({
          company,
          bankAccountId,
          fromDate: "2018-01-01",
          toDate: "2025-11-02",
          dns,
          secretName,
          options: {
            AccountNumber: accountNumber,
            RuntimeUrl: "",
            TASVersion: "",
            ERPLogInfo: "",
            IBAN: "",
            RoutingNumber: "",
            SWIFTCode: "",
            BankFabricCommunicationName: "",
            BankFabricFileLocation: "",
            BankFabricBankRecFormatName: "",
          },
        });

        const res = await client.import(body);

        // Accept 200 or 412 (both are valid responses for this API)
        expect([200, 412]).toContain(res.status);

        validateImportBankStatementsResponse(res.json);

        // If business logic failed, throw a helpful error message
        if (res.json.ImportsWithErrors > 0) {
          const sources = Array.isArray(res.json.BankImportSources) ? res.json.BankImportSources : [];
          const reasons = sources
            .map((s: any) => s?.Reason)
            .filter(Boolean)
            .join(" | ");

          throw new Error(
            `BankStatements import had errors. ImportsWithErrors=${res.json.ImportsWithErrors}. Reasons: ${reasons}`
          );
        }

        // Success expectations
        expect(res.json.ImportsWithErrors).toBe(0);
        expect(res.json.ImportsSucceeded).toBeGreaterThan(0);
      },
      {
        label: "BankStatementsImport-CAMT053",
        attachOnPass: true,
        attachResponseBody: true,
        context: () => ({
          exchange: client.getLastExchange(),
          env: envCfg.name,
          dns,
          company: envCfg.bankStatements.camt053.company,
          bankAccountId: envCfg.bankStatements.camt053.bankAccountId,
          accountNumber: envCfg.bankStatements.camt053.accountNumber,
        }),
      }
    );
  });
});
