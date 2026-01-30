import { test, expect } from "../../src/fixtures/apiFixture";
import { AssistedSetupClient } from "../../src/clients/assistedSetup.client";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { validatePaymentSpecListResponse } from "../../src/validators/assistedSetup/paymentSpecList.validator";
import { buildPaymentSpecListRequest } from "../../src/payloads/assistedSetup/paymentSpecList.payload";
import { resolveDns } from "../../src/config/resolveDns";
import { loadEnvConfig } from "../../src/config/types"; 
import { resolveEnvName } from "../../src/config/resolveEnv"; 
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:assisted-setup", () => {
      test("Assisted Setup → paymentSpecList (discovered APIName/APIVersion)", async ({ api, envCfg }, testInfo) => {
        addTestMeta(testInfo, { capability: "assisted-setup", smoke: true, critical: true });

      const client = new AssistedSetupClient(api);
      const dns = resolveDns(envCfg);

      await withFailureArtifacts(testInfo, async () => {
        // 1) Discover APIName/APIVersion from webApiList
        const web = await client.webApiList({
            Purpose_AP: true, 
            Purpose_APStatus: false, 
            Purpose_BankStatements: false, 
            DNS: dns
          });
          
          expect(web.status).toBe(200);

        // Best-effort discovery: pick first item that has Name + Version
        const apis = Array.isArray(web.json?.WebAPIs) ? web.json.WebAPIs : [];
        const picked = apis.find((a: any) => typeof a?.Name === "string" && typeof a?.Version === "string");

        if (!picked) {
          throw new Error(`No APIName/APIVersion discovered from webApiList. WebAPIs length=${apis.length}`);
        }

        // 2) Build request
        const body = buildPaymentSpecListRequest(picked.Name, picked.Version, dns, {
          Communication_WebAPIBased: true,
          Communication_FileBased: false,
          // keep FormatId/Group/Version empty per your example
        });

        // 3) Call endpoint
        const res = await client.paymentSpecList(body);
        expect(res.status).toBe(200);
      
        // 4) Validate minimal contract
        validatePaymentSpecListResponse(res.json);

          // Optional: smoke assertion (if Success should be true)
        expect(res.json.Success).toBeTruthy();
      },
      {  
          label: "PaymentSpecList",
          attachOnPass: true,
          attachResponseBody: true,
          context: () => ({
            exchange: client.getLastExchange(),
            env: envCfg.name,
            dns,
          }),

      });
    });
});
