import { NextResponse } from "next/server";
import { getAdminSession, verifyAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  return NextResponse.json({ success: true, email: session.email });
}
