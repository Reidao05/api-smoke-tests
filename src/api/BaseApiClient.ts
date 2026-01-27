export type ApiExchangeSnapshot = {
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    headers?: Record<string, string>;
    body?: any;
  };
};

export abstract class BaseApiClient {
  protected lastExchange: ApiExchangeSnapshot | null = null;

  protected captureRequest(req: ApiExchangeSnapshot["request"]) {
    this.lastExchange = { request: req };
  }

  protected captureResponse(res: ApiExchangeSnapshot["response"]) {
    if (!this.lastExchange) {
      this.lastExchange = { request: { method: "UNKNOWN", url: "UNKNOWN" } };
    }
    this.lastExchange.response = res;
  }

  public getLastExchange(): ApiExchangeSnapshot | null {
    return this.lastExchange;
  }
}
