import { z } from "zod";

export const manualOrderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  productName: z.string().min(1, "Product name is required"),
  configurationLabel: z.string().optional().nullable(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPriceAmount: z.number().int().nonnegative().optional().nullable(),
  priceStatus: z.enum(["fixed", "pending_confirmation"]).optional().default("fixed"),
  sku: z.string().optional().nullable(),
  lotNumber: z.string().optional().nullable(),
});

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional().nullable(),
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Postal code is required"),
  country: z.string().optional().default("United States"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional().nullable(),
});

export const checkoutSubmissionSchema = z.object({
  submissionKey: z.string().min(1, "Submission idempotency key is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional().nullable(),
  shippingAddress: shippingAddressSchema,
  shippingMethodId: z.string().default("standard"),
  preferredPaymentMethod: z.enum(["zelle", "venmo", "manual_invoice", "cashapp", "crypto", "ach"]).default("zelle"),
  promoCode: z.string().optional().nullable(),
  affiliateCode: z.string().optional().nullable(),
  ruoAgreed: z.boolean().refine((val) => val === true, {
    message: "You must confirm that materials are for Research Use Only (RUO)",
  }),
  items: z.array(manualOrderItemSchema).min(1, "At least one item is required in the cart"),
  notes: z.string().optional().nullable(),
});

export type CheckoutSubmission = z.infer<typeof checkoutSubmissionSchema>;
export type ManualOrderItem = z.infer<typeof manualOrderItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
