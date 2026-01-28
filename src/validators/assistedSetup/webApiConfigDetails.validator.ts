export function validateWebApiConfigDetailsResponse(json: any): void {
  if (!json || typeof json !== "object") {
    throw new Error("webApiConfigDetails response is not an object");
  }

  if (typeof json.Success !== "boolean") {
    throw new Error("webApiConfigDetails response missing boolean Success");
  }

  // Message/FailReason can be null per your example
  if (!(typeof json.Message === "string" || json.Message === null)) {
    throw new Error("webApiConfigDetails response Message must be string or null");
  }
  if (!(typeof json.FailReason === "string" || json.FailReason === null)) {
    throw new Error("webApiConfigDetails response FailReason must be string or null");
  }

  // WebAPI_Settings can be array or null (your example shows array)
  if (json.WebAPI_Settings != null && !Array.isArray(json.WebAPI_Settings)) {
    throw new Error("webApiConfigDetails response WebAPI_Settings must be array or null");
  }

  if (Array.isArray(json.WebAPI_Settings)) {
    for (const f of json.WebAPI_Settings) {
      if (!f || typeof f !== "object") throw new Error("WebAPI_Settings contains non-object");

      if (typeof f.FieldName !== "string") throw new Error("WebAPI_Settings[].FieldName must be string");
      if (typeof f.LabelText !== "string") throw new Error("WebAPI_Settings[].LabelText must be string");
      if (typeof f.FieldType !== "string") throw new Error("WebAPI_Settings[].FieldType must be string");

      // FieldValue can be null or string (or other, depending on API — keep smoke-friendly)
      if (!(f.FieldValue === null || typeof f.FieldValue === "string")) {
        throw new Error("WebAPI_Settings[].FieldValue must be string or null");
      }

      if (typeof f.Required !== "boolean") throw new Error("WebAPI_Settings[].Required must be boolean");
      if (!Array.isArray(f.SelectionOptions)) throw new Error("WebAPI_Settings[].SelectionOptions must be array");

      for (const opt of f.SelectionOptions) {
        if (!opt || typeof opt !== "object") throw new Error("SelectionOptions contains non-object");
        if (typeof opt.FieldID !== "number") throw new Error("SelectionOptions[].FieldID must be number");
        if (typeof opt.DisplayValue !== "string") throw new Error("SelectionOptions[].DisplayValue must be string");
      }
    }
  }
}
