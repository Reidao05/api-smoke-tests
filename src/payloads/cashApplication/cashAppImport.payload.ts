export type CashAppImportRequest = {
  Company: string;
  BankAccountId: string;
  DNS: string;
  ERPLogInfo: string;
  TASVersion: string;
  SecretName: string;
  RuntimeUrl: string;
};

export function buildCashAppImportRequest(input: {
  company: string;
  bankAccountId: string;
  dns: string;
  options?: Partial<
    Pick<
      CashAppImportRequest,
      "ERPLogInfo" | "TASVersion" | "SecretName" | "RuntimeUrl"
    >
  >;
}): CashAppImportRequest {
  const Company = (input.company ?? "").trim();
  const BankAccountId = (input.bankAccountId ?? "").trim();
  const DNS = (input.dns ?? "").trim();

  if (!Company) throw new Error("Company is required");
  if (!BankAccountId) throw new Error("BankAccountId is required");
  if (!DNS) throw new Error("DNS is required");

  return {
    Company,
    BankAccountId,
    DNS,
    ERPLogInfo: input.options?.ERPLogInfo ?? "",
    TASVersion: input.options?.TASVersion ?? "",
    SecretName: input.options?.SecretName ?? "",
    RuntimeUrl: input.options?.RuntimeUrl ?? "",
  };
}
