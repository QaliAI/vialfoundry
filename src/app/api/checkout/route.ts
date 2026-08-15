import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase/route';
import { sendTransactionalEmail } from '../../../lib/adapters/emailAdapter';

interface InquiryItem {
  name: string;
  sku?: string;
  lotNumber?: string;
  quantity: number;
  unitPrice: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      customerEmail,
      shippingAddress,
      items,
    }: {
      amount?: number;
      customerEmail?: string;
      shippingAddress?: Record<string, string>;
      items?: InquiryItem[];
    } = body;

    const orderNumber = `VF-${Date.now().toString().slice(-8)}`;
    const subtotal = (items || []).reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const total = typeof amount === 'number' ? amount : subtotal;

    const supabase = createRouteClient();

    if (supabase) {
      // Generate the id here so we don't need a RETURNING select (anon key has no
      // public SELECT policy on orders, which would otherwise roll back the insert).
      const orderId = crypto.randomUUID();

      const { error: orderErr } = await supabase.from('orders').insert({
        id: orderId,
        order_number: orderNumber,
        guest_email: customerEmail || null,
        status: 'inquiry',
        payment_status: 'unpaid',
        fulfillment_status: 'unfulfilled',
        subtotal,
        total_amount: total,
        shipping_address: shippingAddress || {},
        notes: 'Inquiry / quote request submitted via storefront.',
      });

      if (orderErr) {
        console.error('[checkout] order insert error', orderErr.message);
      } else if (items && items.length) {
        const orderItems = items.map((i) => ({
          order_id: orderId,
          product_name: i.name,
          sku: i.sku || 'N/A',
          unit_price: i.unitPrice,
          quantity: i.quantity,
          total_price: i.unitPrice * i.quantity,
        }));
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) console.error('[checkout] items insert error', itemsErr.message);
      }
    }

    // Notifications (no-op without RESEND_API_KEY)
    const itemLines = (items || [])
      .map((i) => `<li>${i.quantity} × ${i.name} — $${(i.unitPrice * i.quantity).toFixed(2)}</li>`)
      .join('');

    await sendTransactionalEmail({
      to: process.env.NOTIFICATION_EMAIL_TO || 'admin@vialfoundry.com',
      subject: `[Vial Foundry] New order inquiry ${orderNumber}`,
      html: `<h2>New order inquiry ${orderNumber}</h2>
        <p><strong>Customer:</strong> ${customerEmail || 'n/a'}</p>
        <p><strong>Estimated total:</strong> $${total.toFixed(2)}</p>
        <ul>${itemLines}</ul>
        <pre>${JSON.stringify(shippingAddress || {}, null, 2)}</pre>`,
    });

    if (customerEmail) {
      await sendTransactionalEmail({
        to: customerEmail,
        subject: `Your Vial Foundry inquiry ${orderNumber} was received`,
        html: `<p>Thank you for your inquiry with Vial Foundry.</p>
          <p>Your reference number is <strong>${orderNumber}</strong>. Our team will review your request and follow up with a quote and payment instructions.</p>
          <ul>${itemLines}</ul>
          <p>All materials are supplied for research use only.</p>`,
      });
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
