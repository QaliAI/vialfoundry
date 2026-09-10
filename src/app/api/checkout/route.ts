import { NextResponse } from "next/server";
import { checkoutSubmissionSchema } from "@/lib/manual-orders/schema";
import { recalculateInvoice, recalculateAffiliateCommission } from "@/lib/admin/order-math.mjs";
import { calculateShipping } from "@/lib/manual-orders/shipping.mjs";
import { lookupAffiliateByCode } from "@/lib/affiliates/server";
import { getBrandConfig } from "@/config/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmailSafely } from "@/lib/email/resend";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order";
import { renderInternalOrderNotificationEmail } from "@/lib/email/templates/internal-order";
import { PRODUCTS } from "@/data/products";
import { isStripeEnabled, stripeSecretMode, stripeConfigStatus } from "@/lib/adapters/stripe-gating.mjs";
import { recordOrderEvent } from "@/lib/admin/order-events";

const PAYMENT_METHOD_DISCOUNT_BPS: Record<string, number> = {
  cashapp: 500, // 5%
  crypto: 500, // 5%
  zelle: 0,
  ach: 0,
  venmo: 0,
  manual_invoice: 0,
};

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = checkoutSubmissionSchema.safeParse(json);

    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const data = result.data;
    const brand = getBrandConfig();
    const supabase = createAdminClient();

    // 1. Check idempotency if database is connected
    if (supabase) {
      const { data: existing } = await supabase
        .from("manual_orders")
        .select("order_number, total_amount, subtotal_amount, discount_amount, shipping_amount, preferred_payment_method")
        .eq("submission_key", data.submissionKey)
        .single();

      if (existing) {
        return NextResponse.json({
          success: true,
          orderNumber: existing.order_number,
          totalAmount: existing.total_amount,
          subtotalAmount: existing.subtotal_amount,
          discountAmount: existing.discount_amount,
          shippingAmount: existing.shipping_amount,
          preferredPaymentMethod: existing.preferred_payment_method,
          isDuplicate: true,
        });
      }
    }

    // 2. Validate items against authoritative catalog & enforce inventory.
    //    Inventory policy (launch): check here, decrement only on confirmed
    //    payment in the Stripe webhook. Sessions do not reserve stock.
    //    See src/lib/admin/inventory.mjs.
    const validatedItems: Array<{
      productId?: string | null;
      variantId?: string | null;
      productName: string;
      configurationLabel?: string | null;
      quantity: number;
      unit_price_amount: number;
      line_total_amount: number;
      price_status: string;
      sku?: string | null;
      lotNumber?: string | null;
    }> = [];

    for (const item of data.items) {
      const catalogProduct = PRODUCTS.find(
        (p) =>
          (item.productId && p.id === item.productId) ||
          (item.sku && p.sku === item.sku) ||
          p.name.toLowerCase() === item.productName.toLowerCase()
      );

      if (catalogProduct) {
        if (!catalogProduct.inStock || catalogProduct.stockCount <= 0) {
          return NextResponse.json(
            { success: false, error: `Product "${catalogProduct.name}" is currently out of stock.` },
            { status: 400 }
          );
        }
        if (item.quantity > catalogProduct.stockCount) {
          return NextResponse.json(
            {
              success: false,
              error: `Requested quantity for "${catalogProduct.name}" (${item.quantity}) exceeds available inventory (${catalogProduct.stockCount}).`,
            },
            { status: 400 }
          );
        }

        const authoritativePriceCents = Math.round(catalogProduct.price * 100);
        validatedItems.push({
          productId: catalogProduct.id,
          variantId: item.variantId || null,
          productName: catalogProduct.name,
          configurationLabel: item.configurationLabel || `${catalogProduct.category} Standard`,
          quantity: item.quantity,
          unit_price_amount: authoritativePriceCents,
          line_total_amount: authoritativePriceCents * item.quantity,
          price_status: "fixed",
          sku: catalogProduct.sku,
          lotNumber: catalogProduct.lotNumber,
        });
      } else {
        // Fallback for custom / non-catalog request
        const priceCents = typeof item.unitPriceAmount === "number" ? Math.max(0, item.unitPriceAmount) : 0;
        validatedItems.push({
          productId: item.productId || null,
          variantId: item.variantId || null,
          productName: item.productName,
          configurationLabel: item.configurationLabel || null,
          quantity: item.quantity,
          unit_price_amount: priceCents,
          line_total_amount: priceCents * item.quantity,
          price_status: item.priceStatus || "fixed",
          sku: item.sku || null,
          lotNumber: item.lotNumber || null,
        });
      }
    }

    // Calculate preliminary subtotal to evaluate shipping
    const preliminarySubtotalCents = validatedItems.reduce(
      (sum, item) => sum + item.unit_price_amount * item.quantity,
      0
    );

    const shippingInfo = calculateShipping(
      preliminarySubtotalCents,
      data.shippingMethodId,
      brand.shippingOptions as any
    );

    // 3. Authoritative server-side math
    const paymentMethodDiscountBps = PAYMENT_METHOD_DISCOUNT_BPS[data.preferredPaymentMethod] || 0;
    const invoice = recalculateInvoice(
      {
        items: validatedItems,
        promoCode: data.promoCode,
        shippingAmount: shippingInfo.amountCents,
        taxAmount: 0,
        paymentMethodDiscountRateBps: paymentMethodDiscountBps,
      },
      brand.promotions
    );

    // 4. Resolve Affiliate Attribution
    let affiliateRecord: any = null;
    let commissionCalc: any = null;

    if (data.affiliateCode) {
      affiliateRecord = await lookupAffiliateByCode(data.affiliateCode);
      if (affiliateRecord) {
        commissionCalc = recalculateAffiliateCommission(
          {
            productSubtotalCents: invoice.subtotal_after_discount || 0,
            promoCode: invoice.promo_code,
            rateBps: affiliateRecord.commissionRateBps,
          },
          brand.affiliateSettings.promoCodeOverrideBps
        );
      }
    }

    // 5. Generate Order Number
    const orderNumber = `VF-${Date.now().toString().slice(-6)}`;
    const orderId = crypto.randomUUID();

    // Stripe only handles checkout when it is explicitly selected, fully
    // credentialed, and the key mode matches this environment. Otherwise we
    // keep the configured manual-invoice flow. We never silently switch to
    // live keys and never invent a sandbox payment method.
    const stripeMode = isStripeEnabled();
    if (process.env.PAYMENT_GATEWAY_TYPE === "stripe" && !stripeMode) {
      const status = stripeConfigStatus();
      console.warn(
        `[checkout] Stripe selected but not enabled (missing=[${status.missing.join(",")}] mismatch=[${status.mismatch.join(",")}] mode=${status.mode || "none"} runtime=${status.runtime})`,
      );
    }
    const stripeLivemode = stripeMode ? stripeSecretMode() === "live" : null;

    // 6. Persist to Supabase
    if (supabase) {
      // Find or create customer
      let customerId: string | null = null;
      try {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", data.customerEmail)
          .single();

        if (customer?.id) {
          customerId = customer.id;
        } else {
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({
              email: data.customerEmail,
              first_name: data.shippingAddress.firstName,
              last_name: data.shippingAddress.lastName,
              company: data.shippingAddress.company || null,
              phone: data.customerPhone || null,
            })
            .select("id")
            .single();
          customerId = newCustomer?.id || null;
        }
      } catch (custErr) {
        console.error("[checkout] customer lookup error:", custErr);
      }

      // Insert order
      const { error: orderErr } = await supabase.from("manual_orders").insert({
        id: orderId,
        order_number: orderNumber,
        submission_key: data.submissionKey,
        customer_id: customerId,
        status: "new",
        checkout_mode: stripeMode ? "stripe" : "manual_invoice",
        payment_provider: stripeMode ? "stripe" : "manual_invoice",
        payment_status: "unpaid",
        preferred_payment_method: stripeMode ? "card" : data.preferredPaymentMethod,
        currency: brand.currency,
        subtotal_amount: invoice.subtotal_amount || 0,
        shipping_amount: invoice.shipping_amount || 0,
        discount_amount: invoice.discount_amount || 0,
        total_amount: invoice.total_amount || 0,
        promo_code: invoice.promo_code,
        customer_email: data.customerEmail,
        customer_name: data.customerName,
        customer_phone: data.customerPhone || null,
        shipping_address_snapshot: data.shippingAddress,
        acknowledgement_snapshot: {
          ruoAgreed: data.ruoAgreed,
          timestamp: new Date().toISOString(),
        },
        affiliate_id: affiliateRecord?.id || null,
        affiliate_code: affiliateRecord?.code || null,
        affiliate_commission_rate_bps: commissionCalc?.affiliate_commission_rate_bps || null,
        affiliate_commission_amount: commissionCalc?.affiliate_commission_amount || 0,
        affiliate_status: affiliateRecord ? "pending_payment" : null,
        notes: data.notes || null,
        is_test: Boolean(data.isTest) || stripeLivemode === false,
        stripe_livemode: stripeLivemode,
      });

      if (orderErr) {
        console.error("[checkout] manual_orders insert error:", orderErr.message);
      } else {
        // Insert line items
        const lineItemInserts = validatedItems.map((i) => ({
          manual_order_id: orderId,
          product_id: i.productId || null,
          variant_id: i.variantId || null,
          product_name: i.productName,
          configuration_label: i.configurationLabel || null,
          sku: i.sku || null,
          lot_number: i.lotNumber || null,
          quantity: i.quantity,
          unit_price_amount: i.unit_price_amount,
          line_total_amount: i.line_total_amount,
          price_status: i.price_status || "fixed",
        }));

        const { error: itemsErr } = await supabase
          .from("manual_order_items")
          .insert(lineItemInserts);
        if (itemsErr) console.error("[checkout] manual_order_items error:", itemsErr.message);

        await recordOrderEvent({
          orderId,
          type: "order_created",
          actor: "customer",
          message: `Order ${orderNumber} placed for ${((invoice.total_amount || 0) / 100).toFixed(2)} ${brand.currency}`,
          metadata: {
            items: validatedItems.length,
            total_amount: invoice.total_amount || 0,
            checkout_mode: stripeMode ? "stripe" : "manual_invoice",
            is_test: Boolean(data.isTest),
          },
        });

        // Record affiliate referral revenue if attributed
        if (affiliateRecord?.id && commissionCalc?.affiliate_commission_amount) {
          await supabase.from("referral_revenue").insert({
            affiliate_id: affiliateRecord.id,
            manual_order_id: orderId,
            order_number: orderNumber,
            gross_revenue_cents: invoice.total_amount || 0,
            product_subtotal_cents: invoice.subtotal_amount || 0,
            commission_rate_bps: commissionCalc.affiliate_commission_rate_bps,
            commission_amount_cents: commissionCalc.affiliate_commission_amount,
            status: "pending_payment",
          });
        }
      }
    }

    // 7. Stripe Checkout. The order already exists and is unpaid; Stripe is the
    //    authoritative confirmation, delivered later by signed webhook.
    if (stripeMode) {
      try {
        const { StripePaymentAdapter } = await import("@/lib/adapters/stripeAdapter");
        const shippingOption = brand.shippingOptions.find((o) => o.id === data.shippingMethodId);

        const session = await new StripePaymentAdapter().createOrderCheckoutSession({
          orderId,
          orderNumber,
          customerEmail: data.customerEmail,
          currency: brand.currency,
          items: validatedItems.map((i) => ({
            productName: i.productName,
            sku: i.sku,
            quantity: i.quantity,
            unit_price_amount: i.unit_price_amount,
          })),
          invoice: {
            subtotal_before_discount: invoice.subtotal_before_discount || 0,
            discount_amount: invoice.discount_amount || 0,
            shipping_amount: invoice.shipping_amount || 0,
            tax_amount: invoice.tax_amount || 0,
            total_amount: invoice.total_amount || 0,
            promo_code: invoice.promo_code,
          },
          shippingLabel: shippingOption?.name || "Shipping",
          promoCode: invoice.promo_code,
          affiliateCode: affiliateRecord?.code || null,
        });

        if (supabase) {
          await supabase
            .from("manual_orders")
            .update({
              stripe_checkout_session_id: session.sessionId,
              status: "pending_payment",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        await recordOrderEvent({
          orderId,
          type: "checkout_session_created",
          actor: "system",
          message: `Stripe Checkout Session created for ${(session.amountTotal / 100).toFixed(2)} ${brand.currency}`,
          metadata: { sessionId: session.sessionId, amountTotal: session.amountTotal },
        });

        // No customer email yet: nothing has been paid. The signed webhook
        // sends "payment received" after settlement so we never confirm an
        // unpaid Stripe session.
        return NextResponse.json({
          success: true,
          orderNumber,
          orderId,
          totalAmount: invoice.total_amount,
          subtotalAmount: invoice.subtotal_amount,
          discountAmount: invoice.discount_amount,
          shippingAmount: invoice.shipping_amount,
          paymentProvider: "stripe",
          checkoutUrl: session.url,
        });
      } catch (stripeErr: any) {
        // Fail closed: never silently fall back to an unpaid manual order when
        // the customer expected to pay by card.
        console.error("[checkout] Stripe session creation failed:", stripeErr?.message || stripeErr);
        await recordOrderEvent({
          orderId,
          type: "payment_failed",
          actor: "system",
          message: `Stripe Checkout Session could not be created: ${stripeErr?.message || "unknown error"}`,
        });
        return NextResponse.json(
          {
            success: false,
            error: "We could not start the secure payment session. Your order was not charged. Please try again or contact support.",
            orderNumber,
          },
          { status: 502 },
        );
      }
    }

    // 8. Manual-invoice flow: non-blocking transactional email
    try {
      const emailContent = renderOrderConfirmationEmail({
        orderNumber,
        customerName: data.customerName,
        items: validatedItems.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPriceCents: i.unit_price_amount || 0,
          lineTotalCents: i.line_total_amount || 0,
        })),
        subtotalCents: invoice.subtotal_before_discount || 0,
        discountCents: invoice.discount_amount || 0,
        shippingCents: invoice.shipping_amount || 0,
        totalCents: invoice.total_amount || 0,
        paymentMethod: data.preferredPaymentMethod,
        paymentState: "awaiting_payment",
        shippingAddress: data.shippingAddress as Record<string, string>,
      });

      // Send to customer
      const customerSend = await sendEmailSafely({
        to: data.customerEmail,
        subject: `[Vial Foundry] Order Request #${orderNumber} Received`,
        html: emailContent.html,
      });
      if (!customerSend.success) {
        console.error(`[checkout] customer email FAILED for ${orderNumber}: ${customerSend.error}`);
      }

      // Operations notification. Manual-invoice orders are unpaid until the
      // desk reconciles payment, so the internal mail says so explicitly
      // rather than reusing the customer confirmation.
      const adminEmails = brand.orderNotificationEmails;
      if (adminEmails.length > 0) {
        const internal = renderInternalOrderNotificationEmail({
          orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items: validatedItems.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            lineTotalCents: i.line_total_amount || 0,
            sku: i.sku,
          })),
          subtotalCents: invoice.subtotal_before_discount || 0,
          discountCents: invoice.discount_amount || 0,
          shippingCents: invoice.shipping_amount || 0,
          totalCents: invoice.total_amount || 0,
          paymentMethod: data.preferredPaymentMethod,
          paymentStatus: "awaiting payment",
          shippingAddress: data.shippingAddress as Record<string, string>,
          promoCode: invoice.promo_code,
          affiliateCode: affiliateRecord?.code || null,
          isTest: Boolean(data.isTest),
          notes: data.notes || null,
          adminOrderUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.vialfoundry.com").replace(/\/$/, "")}/admin/orders?order=${encodeURIComponent(orderNumber)}`,
        });

        const adminSend = await sendEmailSafely({
          to: adminEmails,
          subject: `${data.isTest ? "[TEST] " : ""}[NEW ORDER] #${orderNumber} — ${data.customerName} ($${((invoice.total_amount || 0) / 100).toFixed(2)}) — awaiting payment`,
          html: internal.html,
        });
        if (!adminSend.success) {
          console.error(`[checkout] admin email FAILED for ${orderNumber}: ${adminSend.error}`);
        }
      }
    } catch (mailErr) {
      console.error("[checkout] mail trigger error:", mailErr);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      totalAmount: invoice.total_amount,
      subtotalAmount: invoice.subtotal_amount,
      discountAmount: invoice.discount_amount,
      shippingAmount: invoice.shipping_amount,
      preferredPaymentMethod: data.preferredPaymentMethod,
    });
  } catch (error: any) {
    console.error("[checkout] unexpected error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
