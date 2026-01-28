export function validateImportBankStatementsResponse(json: any): void {
  if (!json || typeof json !== "object") {
    throw new Error("bankStatements/import response is not an object");
  }

  if (typeof json.ImportsSucceeded !== "number") {
    throw new Error("ImportsSucceeded must be a number");
  }
  if (typeof json.ImportsWithErrors !== "number") {
    throw new Error("ImportsWithErrors must be a number");
  }

  // These are sensitive-ish; allow string or null.
  if (!(typeof json.NewSecret === "string" || json.NewSecret === null || json.NewSecret === undefined)) {
    throw new Error("NewSecret must be string/null/undefined");
  }
  if (!(typeof json.NewSecretName === "string" || json.NewSecretName === null || json.NewSecretName === undefined)) {
    throw new Error("NewSecretName must be string/null/undefined");
  }

  if (json.BankImportSources != null && !Array.isArray(json.BankImportSources)) {
    throw new Error("BankImportSources must be an array or null");
  }

  if (Array.isArray(json.BankImportSources)) {
    for (const src of json.BankImportSources) {
      if (!src || typeof src !== "object") throw new Error("BankImportSources contains non-object");
      if (typeof src.BFIdentifier !== "string") throw new Error("BankImportSources[].BFIdentifier must be string");
      if (typeof src.Success !== "boolean") throw new Error("BankImportSources[].Success must be boolean");
      if (typeof src.Reason !== "string") throw new Error("BankImportSources[].Reason must be string");

      if (src.BankStatements != null && !Array.isArray(src.BankStatements)) {
        throw new Error("BankImportSources[].BankStatements must be array or null");
      }
    }
  }
}
