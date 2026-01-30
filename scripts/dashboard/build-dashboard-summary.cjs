// scripts/dashboard/build-dashboard-summary.cjs
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { XMLParser } = require("fast-xml-parser");

const DEFAULT_CRITICAL_CAPS = new Set(["bank-statements", "payments", "assisted-setup"]);

/**
 * Extract tags from a string like:
 * "@smoke @critical @cap:payments ..."
 */
function extractTags(text) {
  const tags = text.match(/@\S+/g) || [];
  const caps = tags
    .filter((t) => t.startsWith("@cap:"))
    .map((t) => t.replace("@cap:", "").trim())
    .filter(Boolean);

  return {
    caps,
    isSmoke: tags.includes("@smoke"),
    isCritical: tags.includes("@critical"),
  };
}

function asArray(v) {
  return Array.isArray(v) ? v : v ? [v] : [];
}

function isFailed(tc) {
  return Boolean(tc.failure || tc.error);
}

function failureReason(tc) {
  const f = tc.failure || tc.error;
  if (!f) return "";
  if (typeof f === "string") return f;
  return f.message || f["#text"] || "failed";
}

/**
 * Playwright JUnit reporter stores testcase fields as XML attributes:
 *  - @_name
 *  - @_classname
 */
function tcText(tc) {
  const name = tc.name ?? tc["@_name"] ?? "";
  const classname = tc.classname ?? tc["@_classname"] ?? "";
  return `${classname} ${name}`.trim();
}

function writeJson(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf8");
}

function emptySummary(env) {
  return {
    generatedAt: new Date().toISOString(),
    env,
    releaseStatus: "NO_SIGNAL",
    totals: { passed: 0, failed: 0, skipped: 0, total: 0, passRate: 0 },
    critical: { failed: 0, total: 0 },
    capabilities: {},
  };
}

function main() {
  const env = process.env.ENV || "qa";
  const junitPath = path.resolve(process.env.JUNIT_PATH || path.join("test-results", "junit.xml"));
  const outDir = path.resolve(process.env.DASHBOARD_OUT_DIR || "artifacts");
  const outPath = path.join(outDir, "dashboard-summary.json");

  // Optional debug logging (set DEBUG_DASHBOARD_SUMMARY=1)
  const debug = process.env.DEBUG_DASHBOARD_SUMMARY === "1";
  const log = (...args) => console.log(...args);
  const dbg = (...args) => debug && console.log(...args);

  log("CWD:", process.cwd());
  log("✅ Using JUnit:", junitPath);

  if (!fs.existsSync(junitPath)) {
    writeJson(outPath, emptySummary(env));
    log(`⚠️ No JUnit found at ${junitPath}. Wrote NO_SIGNAL summary -> ${outPath}`);
    return;
  }

  const xml = fs.readFileSync(junitPath, "utf8");

  const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);

  // Handle common JUnit shapes
  const suites = asArray(parsed.testsuites?.testsuite || parsed.testsuite);
  const testcases = suites.flatMap((s) => asArray(s.testcase));

  if (debug) {
    dbg("Suites:", suites.length);
    dbg("Testcases:", testcases.length);
    dbg("First testcase keys:", Object.keys(testcases[0] || {}));
    dbg("First testcase raw:", JSON.stringify(testcases[0] || {}, null, 2));
    dbg(
      "Sample testcase text:",
      testcases.slice(0, 3).map((tc) => tcText(tc))
    );
  }

  // Only include smoke tests (your intended behavior)
  const smokeCases = testcases.filter((tc) => extractTags(tcText(tc)).isSmoke);

  // Validation: If you expect smoke tests but none were detected, make it obvious.
  // (If you prefer silent NO_SIGNAL, change to writing empty summary and return.)
  if (!smokeCases.length) {
    const hint =
      testcases.length > 0
        ? "JUnit contains testcases, but none include @smoke in testcase name/classname."
        : "No <testcase> nodes found in JUnit.";
    const err = `❌ Dashboard summary: 0 smoke testcases detected. ${hint}`;
    // In pipeline, failing fast is usually better than a blank dashboard.
    // If you want non-fatal behavior, replace throw with writeJson(outPath, emptySummary(env)) and return.
    throw new Error(err);
  }

  dbg("Smoke testcases:", smokeCases.length);
  dbg("Sample smoke text:", smokeCases.slice(0, 3).map((tc) => tcText(tc)));

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  let criticalTotal = 0;
  let criticalFailed = 0;

  const capabilities = {};

  for (const tc of smokeCases) {
    const full = tcText(tc);
    const tags = extractTags(full);
    const caps = tags.caps.length ? tags.caps : ["uncategorized"];

    const failedCase = isFailed(tc);
    const skippedCase = Boolean(tc.skipped);

    if (skippedCase) skipped++;
    else if (failedCase) failed++;
    else passed++;

    const isCrit = tags.isCritical || caps.some((c) => DEFAULT_CRITICAL_CAPS.has(c));
    if (isCrit) {
      criticalTotal++;
      if (failedCase) criticalFailed++;
    }

    for (const cap of caps) {
      const row =
        capabilities[cap] ||
        (capabilities[cap] = {
          status: "PASS",
          passed: 0,
          failed: 0,
          skipped: 0,
          total: 0,
          criticalFailed: 0,
          examples: [],
        });

      row.total++;

      if (skippedCase) {
        row.skipped++;
      } else if (failedCase) {
        row.failed++;
        row.status = "FAIL";
        if (isCrit) row.criticalFailed++;

        if (row.examples.length < 3) {
          row.examples.push({
            name: tc["@_name"] ?? tc.name ?? "unknown",
            reason: failureReason(tc),
          });
        }
      } else {
        row.passed++;
      }
    }
  }

  const total = passed + failed + skipped;
  const passRate = total ? Math.round((passed / total) * 100) : 0;

  let releaseStatus = "HEALTHY";
  if (!total) releaseStatus = "NO_SIGNAL";
  else if (criticalFailed) releaseStatus = "BLOCKED";
  else if (failed) releaseStatus = "DEGRADED";

  writeJson(outPath, {
    generatedAt: new Date().toISOString(),
    env,
    releaseStatus,
    totals: { passed, failed, skipped, total, passRate },
    critical: { failed: criticalFailed, total: criticalTotal },
    capabilities,
  });

  log(`✅ Wrote dashboard summary -> ${outPath}`);
}

main();
