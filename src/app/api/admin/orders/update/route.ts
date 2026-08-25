import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { updateAdminOrderStatus } from "@/lib/admin/orders";

export async function POST(req: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, nextStatus, trackingNumber, notes, actor = "admin" } = body;

    if (!orderId || !nextStatus) {
      return NextResponse.json({ success: false, error: "Order ID and next status required" }, { status: 400 });
    }

    const updated = await updateAdminOrderStatus({
      orderId,
      nextStatus,
      trackingNumber,
      notes,
      actor,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("[admin/orders/update] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
