export type PaymentSpecListRequest = {
  FormatId: string;
  FormatGroup: string;
  FormatGroupVersion: string;
  APIName: string;
  APIVersion: string;
  Communication_FileBased: boolean;
  Communication_WebAPIBased: boolean;
  DNS: string;
};

export type PaymentSpecListOptions = Partial<
  Pick<
    PaymentSpecListRequest,
    | "FormatId"
    | "FormatGroup"
    | "FormatGroupVersion"
    | "Communication_FileBased"
    | "Communication_WebAPIBased"
  >
>;

/**
 * POST /api/assistedsetup/paymentspeclist
 *
 * Smoke-friendly rules:
 * - APIName + APIVersion are discovered dynamically (from webApiList).
 * - DNS is injected explicitly.
 * - Keep payload deterministic: no env reads here.
 */
export function buildPaymentSpecListRequest(
  apiName: string,
  apiVersion: string,
  dns: string,
  options: PaymentSpecListOptions = {}
): PaymentSpecListRequest {
  const name = (apiName ?? "").trim();
  const ver = (apiVersion ?? "").trim();
  const dnsTrimmed = (dns ?? "").trim();

  if (!name) throw new Error("APIName is required for paymentSpecList request");
  if (!ver) throw new Error("APIVersion is required for paymentSpecList request");
  if (!dnsTrimmed) throw new Error("DNS is required for paymentSpecList request");

  return {
    FormatId: options.FormatId ?? "",
    FormatGroup: options.FormatGroup ?? "",
    FormatGroupVersion: options.FormatGroupVersion ?? "",
    APIName: name,
    APIVersion: ver,
    Communication_FileBased: options.Communication_FileBased ?? false,
    Communication_WebAPIBased: options.Communication_WebAPIBased ?? true,
    DNS: dnsTrimmed,
  };
}
