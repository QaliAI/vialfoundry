import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { performBulkOrderAction } from "@/lib/admin/orders";

export async function POST(req: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderIds, action, statusValue, actor = "admin" } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !action) {
      return NextResponse.json({ success: false, error: "Valid order IDs array and action required" }, { status: 400 });
    }

    const results = await performBulkOrderAction({
      orderIds,
      action,
      statusValue,
      actor,
    });

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("[admin/orders/bulk-actions] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
