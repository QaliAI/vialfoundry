export interface TaxCalculationRequest {
  subtotal: number;
  shippingAmount: number;
  state?: string;
  country?: string;
  zipCode?: string;
}

export function calculateTax(req: TaxCalculationRequest): number {
  // Placeholder tax adapter abstraction for future tax service connection (e.g. TaxJar / Avalara)
  return 0.0;
}
