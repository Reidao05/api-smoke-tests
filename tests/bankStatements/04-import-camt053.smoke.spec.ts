import { test, expect } from "../../src/fixtures/apiFixture";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { BankStatementsClient } from "../../src/clients/bankStatements.client";
import { buildImportBankStatementsRequest } from "../../src/payloads/bankStatements/importBankStatements.payload";
import { validateImportBankStatementsResponse } from "../../src/validators/bankStatements/importBankStatements.validator";

test("Bank Statements → import-CAMT053 (smoke)", async ({ api, envCfg }, testInfo) => {
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
          // keep the rest empty to match your example
          RuntimeUrl: "", // safe; endpoint ignores if not needed
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
      expect(res.status).toBe(200);

      validateImportBankStatementsResponse(res.json);

      expect(res.json.ImportsWithErrors).toBe(0);
      expect(res.json.ImportsSucceeded).toBeGreaterThan(0);

      // Bonus: CAMT053 tends to have statement lines; assert at least one line exists.
      const sources = Array.isArray(res.json.BankImportSources) ? res.json.BankImportSources : [];
      const statements = sources.flatMap((s: any) => (Array.isArray(s.BankStatements) ? s.BankStatements : []));
      const lines = statements.flatMap((st: any) => (Array.isArray(st.BankStatementLines) ? st.BankStatementLines : []));
      expect(lines.length).toBeGreaterThan(0);
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
