export interface ShippingRateRequest {
  subtotal: number;
  destinationZip?: string;
  destinationCountry?: string;
  itemsCount: number;
}

export interface ShippingRateResult {
  methodName: string;
  cost: number;
  estimatedDays: string;
  isFreeShipping: boolean;
}

export function calculateShippingRate(req: ShippingRateRequest): ShippingRateResult {
  const FREE_SHIPPING_THRESHOLD = 150.0;
  const FLAT_RATE_SHIPPING = 15.0;

  if (req.subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      methodName: 'Insulated Cold-Chain Express (Free Tier)',
      cost: 0.0,
      estimatedDays: '1-2 Business Days',
      isFreeShipping: true
    };
  }

  return {
    methodName: 'Insulated Cold-Chain Express',
    cost: FLAT_RATE_SHIPPING,
    estimatedDays: '1-2 Business Days',
    isFreeShipping: false
  };
}
