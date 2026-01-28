export type WebApiConfigDetailsRequest = {
  APIName: string;
  APIVersion: string;
  DNS: string;
};

export function buildWebApiConfigDetailsRequest(
  apiName: string,
  apiVersion: string,
  dns: string
): WebApiConfigDetailsRequest {
  const name = (apiName ?? "").trim();
  const ver = (apiVersion ?? "").trim();
  const dnsTrimmed = (dns ?? "").trim();

  if (!name) throw new Error("APIName is required for webapi/configdetails request");
  if (!ver) throw new Error("APIVersion is required for webapi/configdetails request");
  if (!dnsTrimmed) throw new Error("DNS is required for webapi/configdetails request");

  return { APIName: name, APIVersion: ver, DNS: dnsTrimmed };
}
