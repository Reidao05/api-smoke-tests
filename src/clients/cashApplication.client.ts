import { APIRequestContext } from "@playwright/test";
import { CashAppImportRequest } from "../payloads/cashApplication/cashAppImport.payload";

type Exchange = {
  method: string;
  url: string;
  requestBody?: any;
  status?: number;
  responseBody?: any;
};

export class CashApplicationClient {
  private lastExchange: Exchange | null = null;

  constructor(private readonly api: APIRequestContext) {}

  private readonly path = "/api/erp/CashApplication/import"; // set correct endpoint

  getLastExchange() {
    return this.lastExchange;
  }

  async import(body: CashAppImportRequest): Promise<{ status: number; json: any }> {
    this.lastExchange = { method: "POST", url: this.path, requestBody: body };

    const resp = await this.api.post(this.path, { data: body });
    const json = await resp.json().catch(() => ({}));

    this.lastExchange = {
      ...this.lastExchange,
      status: resp.status(),
      responseBody: json,
    };

    return { status: resp.status(), json };
  }
}
