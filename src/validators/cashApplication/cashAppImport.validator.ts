import { expect } from "@playwright/test";

export function validateCashAppImportResponse(json: any) {
  // Top-level
  expect(json && typeof json === "object").toBeTruthy();
  expect(typeof json.ImportsSucceeded).toBe("number");
  expect(typeof json.ImportsWithErrors).toBe("number");
  expect(typeof json.NewSecret).toBe("string");
  expect(typeof json.NewSecretName).toBe("string");
  expect(Array.isArray(json.CashAppImportSources)).toBeTruthy();

  for (const src of json.CashAppImportSources) {
    expect(typeof src.BFIdentifier).toBe("string");
    expect(typeof src.Success).toBe("boolean");
    expect(typeof src.Reason).toBe("string");
    expect(Array.isArray(src.CashAppHeaders)).toBeTruthy();

    // Headers can be empty (your sample proves it)
    for (const header of src.CashAppHeaders) {
      expect(typeof header.Company).toBe("string");
      expect(typeof header.BankAccountId).toBe("string");
      expect(typeof header.LockboxAccountNumber).toBe("string");
      expect(typeof header.BatchNumber).toBe("string");
      expect(typeof header.PaymentCount).toBe("number");
      expect(typeof header.PaymentTotal).toBe("number");
      expect(Array.isArray(header.CashAppPayments)).toBeTruthy();

      for (const pay of header.CashAppPayments) {
        expect(typeof pay.BatchNumber).toBe("string");
        expect(typeof pay.BatchSequence).toBe("number");
        expect(typeof pay.PaymentAmount).toBe("number");
        expect(typeof pay.PaymentDate).toBe("string");
        expect(typeof pay.PaymentReference).toBe("string");
        expect(typeof pay.CustomerName).toBe("string");
        expect(Array.isArray(pay.CashAppInvoices)).toBeTruthy();

        for (const inv of pay.CashAppInvoices) {
          expect(typeof inv.BatchNumber).toBe("string");
          expect(typeof inv.BatchSequence).toBe("number");
          expect(typeof inv.LastIndicator).toBe("number");
          expect(typeof inv.InvoiceReference).toBe("string");
          expect(typeof inv.InvoiceSettleAmount).toBe("number"); // can be negative
          expect(typeof inv.DiscountSettleAmount).toBe("number");
        }
      }
    }
  }
}
