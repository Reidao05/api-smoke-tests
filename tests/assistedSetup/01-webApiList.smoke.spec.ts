import { test, expect } from "../../src/fixtures/apiFixture";
import { AssistedSetupClient } from "../../src/clients/assistedSetup.client";
import { validateWebApiListResponse } from "../../src/validators/assistedSetup/webApiList.validator";
import { withFailureArtifacts } from "../../src/utils/withFailureArtifacts";
import { resolveDns } from "../../src/config/resolveDns";
import { addTestMeta } from "../../src/utils/testMeta";

test.describe("@smoke @critical @cap:assisted-setup", () => {
  test("Assisted Setup → WebApiList contract (WebApi Settings)", async ({ api, envCfg }, testInfo) => {
    addTestMeta(testInfo, { capability: "Assisted-Setup", smoke: true, critical: true });
    //test("webApiList contract", async ({ api, envCfg }, testInfo) => {
      const dns = resolveDns(envCfg);
      const client = new AssistedSetupClient(api);

      await withFailureArtifacts(
        testInfo,
        async () => {
          const res = await client.webApiList({
            Purpose_AP: true,
            Purpose_APStatus: false,
            Purpose_BankStatements: false,
            DNS: dns,
          });

          expect(res.status).toBe(200);
          validateWebApiListResponse(res.json);
        },
        {
          label: "webapilist",
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