import { NextResponse } from "next/server";
import { requireAdminActor, verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRODUCTS } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, sku, name, inventory_quantity")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: "Lookup failed" }, { status: 500 });
  }

  const catalog = new Map(PRODUCTS.map((p) => [p.id, p]));
  const products = (data || []).map((row: any) => {
    const cat = catalog.get(row.id);
    return {
      id: row.id,
      sku: row.sku || cat?.sku,
      name: row.name || cat?.name,
      inventory_quantity: Number(row.inventory_quantity) || 0,
    };
  });

  const { data: logs } = await supabase
    .from("inventory_transactions")
    .select("id, product_id, transaction_type, quantity_change, reason, created_by, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  return NextResponse.json({ success: true, products, logs: logs || [] });
}

export async function POST(req: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const actor = (await requireAdminActor()) || "admin";

  const body = await req.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const delta = Number(body.delta);

  if (!productId || !Number.isInteger(delta) || delta === 0) {
    return NextResponse.json({ success: false, error: "productId and integer delta are required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
  }

  const { data: applied, error } = await supabase.rpc("apply_inventory_delta", {
    p_id: productId,
    p_delta: delta,
  });

  if (error || !applied || applied.length === 0) {
    return NextResponse.json({ success: false, error: error?.message || "Inventory update failed." }, { status: 502 });
  }

  const row = applied[0];
  await supabase.from("inventory_transactions").insert({
    product_id: productId,
    transaction_type: "manual_adjustment",
    quantity_change: delta,
    previous_quantity: row.previous_quantity,
    new_quantity: row.new_quantity,
    reason: "Admin console adjustment",
    reference_id: null,
    created_by: actor,
  });

  return NextResponse.json({
    success: true,
    productId,
    previous: row.previous_quantity,
    next: row.new_quantity,
    actor,
  });
}
