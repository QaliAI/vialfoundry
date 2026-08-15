import { LucideIcon, Banknote, Bitcoin, Landmark, Smartphone } from 'lucide-react';

export type PaymentMethodId = 'cashapp' | 'crypto' | 'zelle' | 'ach';

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  tagline: string;
  icon: LucideIcon;
  /** Discount applied to subtotal when this method is selected, as a fraction (0.05 = 5%). */
  discountRate: number;
  /** Config values shown to the customer as payment instructions. Populated from env. */
  handle: string;
  link?: string;
  /** Step-by-step instructions rendered on the confirmation page. */
  steps: string[];
}

// NEXT_PUBLIC_* so values are available in client components. Fill these in Vercel / .env.local.
const CASHAPP = process.env.NEXT_PUBLIC_CASHAPP_CASHTAG || '$YourCashtag';
const ZELLE = process.env.NEXT_PUBLIC_ZELLE_HANDLE || 'payments@vialfoundry.com';
const NOWPAYMENTS = process.env.NEXT_PUBLIC_NOWPAYMENTS_LINK || '';
const LINKMONEY = process.env.NEXT_PUBLIC_LINKMONEY_LINK || '';

export const CASHAPP_DISCOUNT = 0.05;
export const CRYPTO_DISCOUNT = 0.05;

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cashapp',
    label: 'CashApp',
    tagline: 'Instant · 5% off',
    icon: Smartphone,
    discountRate: CASHAPP_DISCOUNT,
    handle: CASHAPP,
    steps: [
      `Open CashApp and send the total to ${CASHAPP}.`,
      'Add your order reference number in the payment note.',
      'Your order ships once payment is confirmed (usually within a few hours).',
    ],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    tagline: 'BTC / USDC / ETH · 5% off',
    icon: Bitcoin,
    discountRate: CRYPTO_DISCOUNT,
    handle: NOWPAYMENTS || 'Payment link provided after checkout',
    link: NOWPAYMENTS || undefined,
    steps: [
      NOWPAYMENTS
        ? 'Use the secure crypto payment link below to pay in BTC, USDC, ETH, and more.'
        : 'A secure crypto payment link will be emailed with your order confirmation.',
      'Include your order reference number if prompted.',
      'Your order ships once the transaction confirms on-chain.',
    ],
  },
  {
    id: 'zelle',
    label: 'Zelle',
    tagline: 'Bank transfer',
    icon: Banknote,
    discountRate: 0,
    handle: ZELLE,
    steps: [
      `Send the total via Zelle to ${ZELLE}.`,
      'Add your order reference number in the memo.',
      'Your order ships once payment is confirmed.',
    ],
  },
  {
    id: 'ach',
    label: 'ACH Bank Transfer',
    tagline: 'Bank-to-bank via link.money',
    icon: Landmark,
    discountRate: 0,
    handle: LINKMONEY || 'Secure bank link provided after checkout',
    link: LINKMONEY || undefined,
    steps: [
      LINKMONEY
        ? 'Use the secure link.money link below to connect your bank and pay by ACH.'
        : 'A secure link.money payment link will be emailed with your order confirmation.',
      'Include your order reference number.',
      'Your order ships once the ACH transfer clears.',
    ],
  },
];

export function getPaymentMethod(id?: string | null): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}
