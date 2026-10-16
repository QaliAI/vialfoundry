import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseOperational } from "@/lib/supabase/operational.mjs";
import { isStripeEnabled } from "@/lib/adapters/stripe-gating.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Probe the actual order database. Environment variable presence is NOT sufficient:
// a paused Supabase project may have valid credentials but cannot save orders.
export async function GET() {
  const noCache = { "Cache-Control": "no-store" };
  const paymentMode = isStripeEnabled() ? "stripe" : "manual_invoice";
  if (!isSupabaseOperational()) {
    return NextResponse.json(
      { status: "unavailable", checkoutAvailable: false, database: "unavailable", paymentMode },
      { status: 503, headers: noCache },
    );
  }
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { status: "unavailable", checkoutAvailable: false, database: "unavailable", paymentMode },
      { status: 503, headers: noCache },
    );
  }
  try {
    const { error } = await supabase
      .from("manual_orders")
      .select("id", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(5000));
    if (error) {
      console.warn("[health/checkout] Order database probe failed:", error.message);
      return NextResponse.json(
        { status: "unavailable", checkoutAvailable: false, database: "unavailable", paymentMode },
        { status: 503, headers: noCache },
      );
    }
    // Never claim card payments work unless the server-side credentials are valid.
    const gatewaySelected = process.env.PAYMENT_GATEWAY_TYPE === "stripe";
    const available = !gatewaySelected || isStripeEnabled();
    return NextResponse.json(
      { status: available ? "ok" : "unavailable", checkoutAvailable: available, database: "available", paymentMode },
      { status: available ? 200 : 503, headers: noCache },
    );
  } catch (err) {
    console.warn("[health/checkout] Order database check exception:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { status: "unavailable", checkoutAvailable: false, database: "unavailable", paymentMode },
      { status: 503, headers: noCache },
    );
  }
}
