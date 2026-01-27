import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./baseApiClient";
import { withDns } from "../payloads/_shared/withDns";

type WebApiListPayload = {
  Purpose_AP: boolean;
  Purpose_APStatus: boolean;
  Purpose_BankStatements: boolean;
};

type WebApiListResult = {
  status: number;
  json: any;
};

export class AssistedSetupClient extends BaseApiClient {
  constructor(private readonly api: APIRequestContext) {
    super();
  }

  async webApiList(
    dns: string,
    payload: WebApiListPayload = {
      Purpose_AP: true,
      Purpose_APStatus: false,
      Purpose_BankStatements: false,
    }
  ): Promise<WebApiListResult> {
    const body = withDns(payload, dns);

    // 👇 capture request snapshot (minimal, safe)
    this.captureRequest({
      method: "POST",
      url: "/api/assistedsetup/webapilist",
      // Don't store Authorization here (fixture already sets it); safer.
      body,
    });

    const res = await this.api.post("/api/assistedsetup/webapilist", { data: body });

    const status = res.status();
    const text = await res.text();

    let json: any;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // capture response even if non-json
      this.captureResponse({
        status,
        headers: res.headers(),
        body: { rawText: text },
      });

      throw new Error(
        `AssistedSetup.webApiList returned non-JSON\nStatus=${status}\nBody=${text}`
      );
    }

    // 👇 capture response snapshot
    this.captureResponse({
      status,
      headers: res.headers(),
      body: json,
    });

    if (!res.ok()) {
      throw new Error(
        `AssistedSetup.webApiList failed\nStatus=${status}\nBody=${text}`
      );
    }

    return { status, json };
  }
}
