# API Smoke Test Framework

## Overview
This repository contains a **post-deployment API smoke test framework** built with **Playwright + TypeScript**.

Its purpose is to answer one critical question after every deployment:

> **Did this deployment break anything critical?**

This is **not** a full regression or negative testing suite.  
It is intentionally:
- fast
- deterministic
- low maintenance
- high signal

Designed to run **after deployment completes** in QA / TEST / PROD.

---

## What This Framework Verifies
- Critical APIs are reachable
- Authentication works
- APIs return successful responses
- Response contracts have not changed or broken
- No deployment/configuration issues slipped through

---

## Tech Stack
- **Playwright** (API testing only)
- **TypeScript**
- **Node.js**
- **Azure DevOps–ready CI pipeline**
- **JUnit + HTML reporting**

---

## Project Structure
.
├── .azure-pipelines/
│ └── api-smoke.yml # Standalone Azure DevOps pipeline
├── src/
│ ├── api/ # Base API client, auth, payload helpers
│ ├── clients/ # Endpoint-specific API clients
│ ├── config/ # Environment loading & resolution
│ ├── payloads/ # Request builders
│ ├── utils/ # Diagnostics & helpers
│ └── validators/ # Contract validators
├── tests/
│ ├── api/ # Smoke tests
│ └── fixtures/ # Playwright API fixtures
├── env.qa.json # Environment config (NO secrets)
├── playwright.config.ts
├── tsconfig.json
└── README.md


---

## Environment Configuration (Important)

### 🔒 No secrets are stored in Git
Environment JSON files (e.g. `env.qa.json`) contain **only environment variable names**, never actual secrets.

Example:
```json
{
  "auth": {
    "clientId": "QA_CLIENT_ID",
    "secret": "QA_CLIENT_SECRET"
  }
}
git status