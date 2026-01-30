import type { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";

type ImportBankStatementsPayload = Record<string, any>;
type ImportBankStatementsResult = { status: number; json: any };

const BUSINESS_STATUSES = new Set([412]); // expand later if needed: 400, 409, 422

export class BankStatementsClient extends BaseApiClient {
  constructor(private readonly api: APIRequestContext) {
    super();
  }

  async import(body: ImportBankStatementsPayload): Promise<ImportBankStatementsResult> {
    this.captureRequest({
      method: "POST",
      url: "/api/erp/bankstatements/import",
      body,
    });

    const res = await this.api.post("/api/erp/bankstatements/import", { data: body });

    const status = res.status();
    const text = await res.text();

    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      this.captureResponse({ status, headers: res.headers(), body: { rawText: text } });
      throw new Error(`BankStatements.import returned non-JSON\nStatus=${status}\nBody=${text}`);
    }

    this.captureResponse({ status, headers: res.headers(), body: json ?? { rawText: text } });

    if (!res.ok() && !BUSINESS_STATUSES.has(status)) {
      throw new Error(`BankStatements.import failed\nStatus=${status}\nBody=${text}`);
    }

    return { status, json };
  }
}
