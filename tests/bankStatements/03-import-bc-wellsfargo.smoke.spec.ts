import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { BankStatementsClient } from "../../src/clients/bankStatements.client";
import { buildImportBankStatementsRequest } from "../../src/payloads/bankStatements/importBankStatements.payload";
import { validateImportBankStatementsResponse } from "../../src/validators/bankStatements/importBankStatements.validator";

test("Bank Statements → import-BC-WellsFargo (smoke)", async ({ api, envCfg }, testInfo) => {
  const dns = resolveDns(envCfg);
  const client = new BankStatementsClient(api);

  await withFailureArtifacts(
    testInfo,
    async () => {
      const company = envCfg.bankStatements.wellsFargo.company;
      const bankAccountId = envCfg.bankStatements.wellsFargo.bankAccountId;
      const secretName = envCfg.secretName;

      const body = buildImportBankStatementsRequest({
        company,
        bankAccountId,
        fromDate: "2025-09-30",
        toDate: "2025-09-30",
        dns,
        secretName,
        options: {
          // Key WellsFargo difference: AccountNumber required
          AccountNumber: bankAccountId,

          // Your example uses empty RuntimeUrl
          RuntimeUrl: "",

          // Keep others empty per request
          TASVersion: "",
          ERPLogInfo: "",
          BankFabricCommunicationName: "",
          BankFabricFileLocation: "",
          BankFabricBankRecFormatName: "",
          IBAN: "",
          RoutingNumber: "",
          SWIFTCode: "",
        },
      });

      const res = await client.import(body);
      expect(res.status).toBe(200);

      validateImportBankStatementsResponse(res.json);

      expect(res.json.ImportsWithErrors).toBe(0);
      expect(res.json.ImportsSucceeded).toBeGreaterThan(0);

      // Optional: ensure at least one statement came back (smoke-level)
      const sources = Array.isArray(res.json.BankImportSources) ? res.json.BankImportSources : [];
      const statements = sources.flatMap((s: any) => (Array.isArray(s.BankStatements) ? s.BankStatements : []));
      expect(statements.length).toBeGreaterThan(0);
    },
    {
      label: "BankStatementsImport-BC-WellsFargo",
      attachOnPass: true,
      attachResponseBody: true,
      context: () => ({
        exchange: client.getLastExchange(),
        env: envCfg.name,
        dns,
        company: envCfg.bankStatements.wellsFargo.company,
        bankAccountId: envCfg.bankStatements.wellsFargo.bankAccountId,
      }),
    }
  );
});
