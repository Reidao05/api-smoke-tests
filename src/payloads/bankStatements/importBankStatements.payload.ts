export type ImportBankStatementsRequest = {
  BankFabricCommunicationName: string;
  BankFabricFileLocation: string;
  BankFabricBankRecFormatName: string;

  Company: string;
  BankAccountId: string;

  FromDate: string; // yyyy-mm-dd
  ToDate: string;   // yyyy-mm-dd

  AccountNumber: string;
  IBAN: string;
  RoutingNumber: string;
  SWIFTCode: string;

  DNS: string;

  ERPLogInfo: string;
  TASVersion: string;

  SecretName: string;
  RuntimeUrl: string;
};

export type ImportBankStatementsOptions = Partial<
  Pick<
    ImportBankStatementsRequest,
    | "BankFabricCommunicationName"
    | "BankFabricFileLocation"
    | "BankFabricBankRecFormatName"
    | "AccountNumber"
    | "IBAN"
    | "RoutingNumber"
    | "SWIFTCode"
    | "ERPLogInfo"
    | "TASVersion"
    | "RuntimeUrl"
  >
>;

export function buildImportBankStatementsRequest(args: {
  company: string;
  bankAccountId: string;
  fromDate: string;
  toDate: string;
  dns: string;
  secretName: string;
  options?: ImportBankStatementsOptions;
}): ImportBankStatementsRequest {
  const company = (args.company ?? "").trim();
  const bankAccountId = (args.bankAccountId ?? "").trim();
  const fromDate = (args.fromDate ?? "").trim();
  const toDate = (args.toDate ?? "").trim();
  const dns = (args.dns ?? "").trim();
  const secretName = (args.secretName ?? "").trim();

  if (!company) throw new Error("Company is required");
  if (!bankAccountId) throw new Error("BankAccountId is required");
  if (!fromDate) throw new Error("FromDate is required");
  if (!toDate) throw new Error("ToDate is required");
  if (!dns) throw new Error("DNS is required");
  if (!secretName) throw new Error("SecretName is required");

  const opt = args.options ?? {};

  return {
    BankFabricCommunicationName: opt.BankFabricCommunicationName ?? "",
    BankFabricFileLocation: opt.BankFabricFileLocation ?? "",
    BankFabricBankRecFormatName: opt.BankFabricBankRecFormatName ?? "",

    Company: company,
    BankAccountId: bankAccountId,

    FromDate: fromDate,
    ToDate: toDate,

    AccountNumber: opt.AccountNumber ?? "",
    IBAN: opt.IBAN ?? "",
    RoutingNumber: opt.RoutingNumber ?? "",
    SWIFTCode: opt.SWIFTCode ?? "",

    DNS: dns,

    ERPLogInfo: opt.ERPLogInfo ?? "",
    TASVersion: opt.TASVersion ?? "",

    SecretName: secretName,
    RuntimeUrl: opt.RuntimeUrl ?? "string",
  };
}
