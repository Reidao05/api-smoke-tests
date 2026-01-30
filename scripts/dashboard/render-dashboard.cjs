const fs = require("node:fs");
const path = require("node:path");

function badge(status) {
  if (status === "BLOCKED") return "🔴 BLOCKED";
  if (status === "DEGRADED") return "🟡 DEGRADED";
  if (status === "HEALTHY") return "🟢 HEALTHY";
  return "⚪ NO SIGNAL";
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function main() {
  const inPath =
    process.env.DASHBOARD_SUMMARY_PATH ??
    path.resolve("artifacts", "dashboard-summary.json");
  const outDir =
    process.env.DASHBOARD_HTML_OUT_DIR ?? path.resolve("artifacts");
  const outPath = path.join(outDir, "dashboard.html");

  if (!fs.existsSync(inPath)) throw new Error(`Missing dashboard summary at ${inPath}`);

  const summary = JSON.parse(fs.readFileSync(inPath, "utf-8"));
  const caps = summary.capabilities || {};

  const order = { FAIL: 0, PASS: 1, NO_SIGNAL: 2 };

  const capRows = Object.entries(caps)
    .sort(([, ra], [, rb]) => {
      const sa = (ra && ra.status) || "NO_SIGNAL";
      const sb = (rb && rb.status) || "NO_SIGNAL";
      return (order[sa] ?? 9) - (order[sb] ?? 9);
    })
    .map(([cap, row]) => {
      const status = (row && row.status) || "NO_SIGNAL";
      const emoji = status === "FAIL" ? "🔴" : status === "PASS" ? "🟢" : "⚪";

      const examples =
        row?.examples?.length
          ? `<ul>${row.examples
              .slice(0, 3)
              .map((e) => `<li><b>${escapeHtml(e?.name)}</b> — ${escapeHtml(e?.reason)}</li>`)
              .join("")}</ul>`
          : "";

      return `
        <tr>
          <td><b>${escapeHtml(cap)}</b></td>
          <td>${emoji} ${escapeHtml(status)}</td>
          <td>${row?.passed ?? 0}</td>
          <td>${row?.failed ?? 0}</td>
          <td>${row?.skipped ?? 0}</td>
          <td>${row?.total ?? 0}</td>
          <td>${row?.criticalFailed ?? 0}</td>
          <td>${examples}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>API Smoke Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .top { display:flex; gap:18px; flex-wrap:wrap; }
    .card { border:1px solid #ddd; border-radius:10px; padding:14px 16px; min-width:220px; }
    .big { font-size: 22px; font-weight: 700; }
    table { width:100%; border-collapse: collapse; margin-top: 14px; }
    th, td { border-bottom:1px solid #eee; padding:10px; vertical-align: top; }
    th { text-align:left; background:#fafafa; }
    .muted { color:#666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>API Smoke Dashboard</h1>
  <div class="muted">Generated: ${escapeHtml(summary.generatedAt)} | ENV: ${escapeHtml(summary.env)}</div>

  <div class="top">
    <div class="card">
      <div class="muted">Release Status</div>
      <div class="big">${badge(summary.releaseStatus)}</div>
    </div>

    <div class="card">
      <div class="muted">Smoke Pass Rate</div>
      <div class="big">${escapeHtml(summary?.totals?.passRate)}%</div>
      <div class="muted">${escapeHtml(summary?.totals?.passed)}/${escapeHtml(summary?.totals?.total)} passed</div>
    </div>

    <div class="card">
      <div class="muted">Critical Failures</div>
      <div class="big">${escapeHtml(summary?.critical?.failed)}</div>
      <div class="muted">${escapeHtml(summary?.critical?.total)} critical tests</div>
    </div>

    <div class="card">
      <div class="muted">Failures</div>
      <div class="big">${escapeHtml(summary?.totals?.failed)}</div>
      <div class="muted">Skipped: ${escapeHtml(summary?.totals?.skipped)}</div>
    </div>
  </div>

  <h2>Business Capability Status</h2>
  <table>
    <thead>
      <tr>
        <th>Capability</th>
        <th>Status</th>
        <th>Passed</th>
        <th>Failed</th>
        <th>Skipped</th>
        <th>Total</th>
        <th>Critical Failed</th>
        <th>Examples</th>
      </tr>
    </thead>
    <tbody>
      ${capRows || `<tr><td colspan="8">No smoke tests found (NO SIGNAL).</td></tr>`}
    </tbody>
  </table>

  <p class="muted">Tip: Click the pipeline artifacts to view Playwright report + failure attachments for details.</p>
</body>
</html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, html, "utf-8");
  console.log(`Wrote dashboard html -> ${outPath}`);
}

main();
