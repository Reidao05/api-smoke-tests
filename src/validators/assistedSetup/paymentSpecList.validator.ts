export function validatePaymentSpecListResponse(json: any): void {
  if (!json || typeof json !== "object") {
    throw new Error("paymentSpecList response is not an object");
  }

  // Required top-level invariants for smoke:
  if (typeof json.Success !== "boolean") {
    throw new Error("paymentSpecList response missing boolean Success");
  }

  if (typeof json.Message !== "string") {
    throw new Error("paymentSpecList response missing string Message");
  }

  if (typeof json.FailReason !== "string") {
    throw new Error("paymentSpecList response missing string FailReason");
  }

  // PaymentSpecs: expect array when Success=true (but allow null/empty if backend does that)
  if (json.PaymentSpecs != null && !Array.isArray(json.PaymentSpecs)) {
    throw new Error("paymentSpecList response PaymentSpecs is not an array or null");
  }

  if (json.Success === true) {
    const specs = Array.isArray(json.PaymentSpecs) ? json.PaymentSpecs : [];
    for (const s of specs) {
      if (!s || typeof s !== "object") throw new Error("PaymentSpecs contains non-object");
      if (typeof s.Name !== "string") throw new Error("PaymentSpecs[].Name must be string");
      if (typeof s.FormatId !== "string") throw new Error("PaymentSpecs[].FormatId must be string");
      if (typeof s.FormatGroupVersion !== "string") {
        throw new Error("PaymentSpecs[].FormatGroupVersion must be string");
      }
      if (typeof s.DataContractVersion !== "string") {
        throw new Error("PaymentSpecs[].DataContractVersion must be string");
      }
    }
  }
}
