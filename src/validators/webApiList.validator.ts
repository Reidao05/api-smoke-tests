import { expect } from "@playwright/test";

export function validateWebApiListResponse(json: any) {
  // --- Top-level contract ---
  expect(json).toBeTruthy();
  expect(json).toHaveProperty("WebAPI_Settings");
 // expect(json).toHaveProperty("WebAPIs");
  expect(json).toHaveProperty("PaymentSpecs");
  expect(json).toHaveProperty("Success");
  expect(json).toHaveProperty("Message");
  expect(json).toHaveProperty("FailReason");

  expect(typeof json.Success).toBe("boolean");

  function failWithContext(message: string, context: unknown) {
  console.error("❌ Validation failed:", message);
  console.error("📦 Context:", JSON.stringify(context, null, 2));
  throw new Error(message);
}


  // Message / FailReason are inconsistent in reality
  expect(
    json.Message === null ||
    typeof json.Message === "string" ||
    typeof json.Message === "object"
  ).toBeTruthy();

  expect(
    json.FailReason === null ||
    typeof json.FailReason === "string" ||
    typeof json.FailReason === "object"
  ).toBeTruthy();

  // --- WebAPI_Settings ---
  expect(json.WebAPI_Settings === null || Array.isArray(json.WebAPI_Settings)).toBeTruthy();

  if (Array.isArray(json.WebAPI_Settings)) {
    for (const s of json.WebAPI_Settings) {
      expect(typeof s.FieldName).toBe("string");
      expect(typeof s.LabelText).toBe("string");
      expect(typeof s.FieldType).toBe("string");
      expect(typeof s.FieldValue).toBe("string");
      expect(typeof s.Required).toBe("boolean");

      expect(s.SelectionOptions === null || Array.isArray(s.SelectionOptions)).toBeTruthy();
      if (Array.isArray(s.SelectionOptions)) {
        for (const opt of s.SelectionOptions) {
          expect(typeof opt.FieldID).toBe("number");
          expect(typeof opt.DisplayValue).toBe("string");
        }
      }
    }
  }

// --- WebAPIs ---
if (!Array.isArray(json?.WebAPIs)) {
  failWithContext("WebAPIs is not an array", json?.WebAPIs);
}

for (const api of json.WebAPIs) {
  if (typeof api.Name !== "string") {
    failWithContext("WebAPIs[].Name is not a string", api);
  }

  if (typeof api.Version !== "string") {
    failWithContext("WebAPIs[].Version is not a string", api);
  }

  if (!(api.Description === null || typeof api.Description === "string")) {
    failWithContext("WebAPIs[].Description must be string or null", api);
  }
}


  // --- PaymentSpecs ---
  expect(json.PaymentSpecs === null || Array.isArray(json.PaymentSpecs)).toBeTruthy();
  if (Array.isArray(json.PaymentSpecs)) {
    for (const p of json.PaymentSpecs) {
      expect(typeof p.Name).toBe("string");
      expect(typeof p.FormatId).toBe("string");
      expect(typeof p.FormatGroupVersion).toBe("string");
      expect(typeof p.DataContractVersion).toBe("string");
    }
  }
}
