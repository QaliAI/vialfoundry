import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmailSafely } from "@/lib/email/resend";
import { renderOrderConfirmationEmail } from "@/lib/email/templates/order";
import { renderTrackingUpdateEmail } from "@/lib/email/templates/tracking";
import { recordOrderEvent } from "@/lib/admin/order-events";

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
    const emailLabel = emailType === "tracking" ? "tracking update" : "order confirmation";

    if (emailType === "tracking" && order.tracking_number) {
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
      const email = renderOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        items: (order.manual_order_items || []).map((i: any) => ({
          name: i.product_name,
          quantity: i.quantity,
          unitPriceCents: i.unit_price_amount || 0,
          lineTotalCents: i.line_total_amount || 0,
        })),
        subtotalCents: order.subtotal_amount,
        discountCents: order.discount_amount,
        shippingCents: order.shipping_amount,
        totalCents: order.total_amount,
        paymentMethod: order.preferred_payment_method,
        paymentState: order.payment_status === 'paid' ? 'paid' : 'awaiting_payment',
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
        message: `Admin resend of ${emailLabel} FAILED to ${order.customer_email}: ${sentResult.error}`,
      });
      return NextResponse.json(
        { success: false, error: sentResult.error || 'Failed to send email via Resend' },
        { status: 502 }
      );
    }

    await recordOrderEvent({
      orderId: order.id,
      type: 'email_sent',
      actor: 'admin-resend',
      message: `Admin resent ${emailLabel} email to ${order.customer_email}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[admin/orders/resend-email] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
