import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { fetchAdminOrders } from "@/lib/admin/orders";

export async function GET(req: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as string | null;
    const includeArchived = searchParams.get("includeArchived") === "true";

    const orders = await fetchAdminOrders({ status: status || undefined, includeArchived });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error("[admin/orders/get] error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}