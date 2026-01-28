import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";
type WebApiListPayload = {
  Purpose_AP: boolean;
  Purpose_APStatus: boolean;
  Purpose_BankStatements: boolean;
  DNS: string;
};

type WebApiListResult = {
  status: number;
  json: any;
};

type PaymentSpecListPayload = {
  FormatId: string;
  FormatGroup: string;
  FormatGroupVersion: string;
  APIName: string;
  APIVersion: string;
  Communication_FileBased: boolean;
  Communication_WebAPIBased: boolean;
  DNS: string;
};

type PaymentSpecListResult = {
  status: number;
  json: any;
};
type WebApiConfigDetailsPayload = {
  APIName: string;
  APIVersion: string;
  DNS: string;
};

type WebApiConfigDetailsResult = {
  status: number;
  json: any;
};


export class AssistedSetupClient extends BaseApiClient {
  constructor(private readonly api: APIRequestContext) {
    super();
  }

  async webApiList(body: WebApiListPayload): Promise<WebApiListResult> {
    this.captureRequest({
      method: "POST",
      url: "/api/assistedsetup/webapilist",
      body,
    
    });

    const res = await this.api.post("/api/assistedsetup/webapilist", { data: body });

    const status = res.status();
    const text = await res.text();

    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      this.captureResponse({ status, headers: res.headers(), body: { rawText: text } });
      throw new Error(`AssistedSetup.webApiList returned non-JSON\nStatus=${status}\nBody=${text}`);
    }

    this.captureResponse({ status, headers: res.headers(), body: json });

    if (!res.ok()) {
      throw new Error(`AssistedSetup.webApiList failed\nStatus=${status}\nBody=${text}`);
    }

    return { status, json };
  }

  async paymentSpecList(body: PaymentSpecListPayload): Promise<PaymentSpecListResult> {
    this.captureRequest({
      method: "POST",
      url: "/api/assistedsetup/paymentspeclist",
      body,
    });

    const res = await this.api.post("/api/assistedsetup/paymentspeclist", { data: body });

    const status = res.status();
    const text = await res.text();

    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      this.captureResponse({ status, headers: res.headers(), body: { rawText: text } });
      throw new Error(
        `AssistedSetup.paymentSpecList returned non-JSON\nStatus=${status}\nBody=${text}`
      );
    }

    this.captureResponse({ status, headers: res.headers(), body: json });

    if (!res.ok()) {
      throw new Error(`AssistedSetup.paymentSpecList failed\nStatus=${status}\nBody=${text}`);
    }

    return { status, json };
  }
  async webApiConfigDetails(
  body: WebApiConfigDetailsPayload
): Promise<WebApiConfigDetailsResult> {
  this.captureRequest({
    method: "POST",
    url: "/api/assistedsetup/webapi/configdetails",
    body,
  });

  const res = await this.api.post("/api/assistedsetup/webapi/configdetails", { data: body });

  const status = res.status();
  const text = await res.text();

  let json: any;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    this.captureResponse({ status, headers: res.headers(), body: { rawText: text } });
    throw new Error(
      `AssistedSetup.webApiConfigDetails returned non-JSON\nStatus=${status}\nBody=${text}`
    );
  }

  this.captureResponse({ status, headers: res.headers(), body: json });

  if (!res.ok()) {
    throw new Error(
      `AssistedSetup.webApiConfigDetails failed\nStatus=${status}\nBody=${text}`
    );
  }

  return { status, json };
}

}
