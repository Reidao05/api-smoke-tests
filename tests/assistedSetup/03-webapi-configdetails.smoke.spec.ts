import { test, expect } from "../../src/fixtures/apiFixture";
import { AssistedSetupClient } from "../../src/clients/assistedSetup.client";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { buildWebApiConfigDetailsRequest } from "../../src/payloads/assistedSetup/webApiConfigDetails.payload";
import { validateWebApiConfigDetailsResponse } from "../../src/validators/assistedSetup/webApiConfigDetails.validator";

test("Assisted Setup → webapi/configdetails (discovered APIName/APIVersion)", async ({ api, envCfg }, testInfo) => {
  const client = new AssistedSetupClient(api);
  const dns = resolveDns(envCfg);

  await withFailureArtifacts(
    testInfo,
    async () => {
      // Discover APIName/APIVersion
      const web = await client.webApiList({
        Purpose_AP: true,
        Purpose_APStatus: false,
        Purpose_BankStatements: false,
        DNS: dns,
      });

      expect(web.status).toBe(200);

      const apis = Array.isArray(web.json?.WebAPIs) ? web.json.WebAPIs : [];
      const picked = apis.find((a: any) => typeof a?.Name === "string" && typeof a?.Version === "string");

      if (!picked) {
        throw new Error(`No APIName/APIVersion discovered from webApiList. WebAPIs length=${apis.length}`);
      }

      // Build payload + call endpoint
      const body = buildWebApiConfigDetailsRequest(picked.Name, picked.Version, dns);
      const res = await client.webApiConfigDetails(body);

      expect(res.status).toBe(200);
      validateWebApiConfigDetailsResponse(res.json);
      expect(res.json.Success).toBeTruthy();
    },
    {
      label: "WebApiConfigDetails",
      attachOnPass: true,
      attachResponseBody: true,
      context: () => ({
        exchange: client.getLastExchange(),
        env: envCfg.name,
        dns,
      }),
    }
  );
});
