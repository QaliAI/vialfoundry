import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmailSafely } from "@/lib/email/resend";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order";
import { renderTrackingUpdateEmail } from "@/lib/email/templates/tracking";
import { renderInternalOrderNotificationEmail } from "@/lib/email/templates/internal-order";
import { recordOrderEvent } from "@/lib/admin/order-events";
import { getBrandConfig } from "@/config/brand";
import { classifyFulfillmentQueue } from "@/lib/admin/order-classification.mjs";

function adminOrderUrl(orderNumber: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.vialfoundry.com").replace(/\/$/, "");
  return `${base}/admin/orders?order=${encodeURIComponent(orderNumber)}`;
}

export async function POST(req: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, emailType } = await req.json();
    const supabase = createAdminClient();
    if (!supabase) throw new Error("Database client unavailable");

    const { data: order, error } = await supabase
      .from("manual_orders")
      .select("*, manual_order_items(*)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    let sentResult: { success: boolean; error?: string };
    let emailLabel: string;
    let targetRecipient: string;
    let isInternal = false;

    if (emailType === "owner_alert") {
      isInternal = true;
      emailLabel = "owner alert";
      const brand = getBrandConfig();
      const admins = brand.orderNotificationEmails;
      if (!admins.length) {
        return NextResponse.json({ success: false, error: "No owner notification emails configured" }, { status: 400 });
      }
      targetRecipient = admins.join(", ");

      const queue = classifyFulfillmentQueue(order);
      const fulfillmentNextStep =
        queue === "WAITING_ON_INVENTORY"
          ? "WAITING ON INVENTORY: Insufficient stock. Replenishment required before packing."
          : queue === "WAITING_ON_DOCUMENTATION"
          ? "WAITING ON DOCUMENTATION: Customer follow-up or documentation needed."
          : queue === "PAID_NEEDS_FULFILLMENT"
          ? "PAID — READY TO PICK AND PACK. Verify items and print shipping label."
          : `Current operational queue: ${queue}`;

      const email = renderInternalOrderNotificationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        items: (order.manual_order_items || []).map((i: any) => ({
          name: i.product_name,
          sku: i.sku,
          quantity: i.quantity,
          unitPriceCents: i.unit_price_amount || 0,
          lineTotalCents: i.line_total_amount || 0,
        })),
        subtotalCents: order.subtotal_amount,
        discountCents: order.discount_amount,
        shippingCents: order.shipping_amount,
        totalCents: order.total_amount,
        shippingAddress: order.shipping_address_snapshot || {},
        paymentMethod: order.preferred_payment_method || "card (Stripe)",
        paymentStatus: order.payment_status || "paid",
        fulfillmentNextStep,
        promoCode: order.promo_code,
        affiliateCode: order.affiliate_code,
        isTest: Boolean(order.is_test) || order.stripe_livemode === false,
        adminOrderUrl: adminOrderUrl(order.order_number),
      });

      sentResult = await sendEmailSafely({
        to: admins,
        subject: `[ADMIN RESEND] ${order.is_test || order.stripe_livemode === false ? "[TEST] " : ""}[PAID] ${order.order_number} — ${order.customer_name} ($${((order.total_amount || 0) / 100).toFixed(2)})`,
        html: email.html,
      });
    } else if (emailType === "tracking" && order.tracking_number) {
      emailLabel = "tracking update";
      targetRecipient = order.customer_email;
      const email = renderTrackingUpdateEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        trackingNumber: order.tracking_number,
      });

      sentResult = await sendEmailSafely({
        to: order.customer_email,
        subject: `[Vial Foundry] Shipment Tracking Update for Order #${order.order_number}`,
        html: email.html,
      });
    } else {
      emailLabel = "order confirmation";
      targetRecipient = order.customer_email;
      const email = renderOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        items: (order.manual_order_items || []).map((i: any) => ({
          name: i.product_name,
          sku: i.sku,
          quantity: i.quantity,
          unitPriceCents: i.unit_price_amount || 0,
          lineTotalCents: i.line_total_amount || 0,
        })),
        subtotalCents: order.subtotal_amount,
        discountCents: order.discount_amount,
        shippingCents: order.shipping_amount,
        totalCents: order.total_amount,
        paymentMethod: order.preferred_payment_method,
        paymentState: order.payment_status === "paid" ? "paid" : "awaiting_payment",
        shippingAddress: order.shipping_address_snapshot || {},
      });

      sentResult = await sendEmailSafely({
        to: order.customer_email,
        subject: `[Vial Foundry] Order Verification #${order.order_number}`,
        html: email.html,
      });
    }

    if (!sentResult.success) {
      await recordOrderEvent({
        orderId: order.id,
        type: 'email_failed',
        actor: 'admin-resend',
        message: `Admin resend of ${emailLabel} FAILED to ${targetRecipient}: ${sentResult.error}`,
        metadata: { error: sentResult.error, emailType, targetRecipient },
      });
      return NextResponse.json(
        { success: false, error: sentResult.error || "Failed to send email via Resend" },
        { status: 502 }
      );
    }

    await recordOrderEvent({
      orderId: order.id,
      type: 'email_sent',
      actor: 'admin-resend',
      message: `Admin resent ${emailLabel} email to ${targetRecipient}`,
      metadata: { emailType, targetRecipient },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/orders/resend-email] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

