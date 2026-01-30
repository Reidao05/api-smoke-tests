import type { TestInfo } from "@playwright/test";

export function addTestMeta(
  testInfo: TestInfo,
  meta: { capability: string; smoke?: boolean; critical?: boolean }
) {
  testInfo.annotations.push({ type: "capability", description: meta.capability });
  testInfo.annotations.push({ type: "smoke", description: String(meta.smoke ?? true) });

  if (meta.critical) {
    testInfo.annotations.push({ type: "critical", description: "true" });
  }
}
