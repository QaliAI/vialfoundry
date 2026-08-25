import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAudit } from "@/lib/admin/audit";

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({ success: true, affiliates: [], applications: [] });

    const [affiliatesRes, applicationsRes] = await Promise.all([
      supabase
        .from("affiliates")
        .select("*, affiliate_aliases(*), referral_revenue(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("affiliate_applications")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (affiliatesRes.error) {
      console.warn("[admin/affiliates] affiliates error:", affiliatesRes.error.message);
    }
    if (applicationsRes.error) {
      console.warn("[admin/affiliates] applications error:", applicationsRes.error.message);
    }

    return NextResponse.json({
      success: true,
      affiliates: affiliatesRes.data || [],
      applications: applicationsRes.data || [],
    });
  } catch (err: any) {
    console.error("[admin/affiliates] GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      action,
      affiliateId,
      applicationId,
      commissionRateBps,
      status,
      name,
      email,
      referralCode,
      actor = "admin"
    } = body;
    const supabase = createAdminClient();
    if (!supabase) throw new Error("Database client unavailable");

    if (action === "create") {
      const code = String(referralCode || name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)).toUpperCase();
      const { data: newAffiliate, error } = await supabase
        .from("affiliates")
        .insert({
          name,
          email,
          referral_code: code,
          commission_rate_bps: commissionRateBps || 1000,
          status: status || "active",
        })
        .select()
        .single();

      if (error) throw error;
      await logAdminAudit({
        actor,
        action: "AFFILIATE_CREATE",
        entityType: "affiliate",
        entityId: newAffiliate.id,
        after: newAffiliate,
      });

      return NextResponse.json({ success: true, affiliate: newAffiliate });
    }

    if (action === "approve_application" && applicationId) {
      const { data: appData, error: appErr } = await supabase
        .from("affiliate_applications")
        .select("*")
        .eq("id", applicationId)
        .single();

      if (appErr || !appData) throw new Error("Application not found");

      const code = String(referralCode || appData.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)).toUpperCase();

      const { data: newAffiliate, error: createErr } = await supabase
        .from("affiliates")
        .insert({
          name: appData.name,
          email: appData.email,
          referral_code: code,
          commission_rate_bps: commissionRateBps || 1000,
          status: "active",
        })
        .select()
        .single();

      if (createErr) throw createErr;

      await supabase
        .from("affiliate_applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      await logAdminAudit({
        actor,
        action: "AFFILIATE_APPLICATION_APPROVE",
        entityType: "affiliate_application",
        entityId: applicationId,
        after: { affiliateId: newAffiliate.id, status: "approved", code },
      });

      return NextResponse.json({ success: true, affiliate: newAffiliate });
    }

    if (action === "reject_application" && applicationId) {
      const { error: rejErr } = await supabase
        .from("affiliate_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (rejErr) throw rejErr;

      await logAdminAudit({
        actor,
        action: "AFFILIATE_APPLICATION_REJECT",
        entityType: "affiliate_application",
        entityId: applicationId,
        after: { status: "rejected" },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "update") {
      const updates: Record<string, any> = {};
      if (commissionRateBps !== undefined) updates.commission_rate_bps = commissionRateBps;
      if (status !== undefined) updates.status = status;

      const { data: updated, error } = await supabase
        .from("affiliates")
        .update(updates)
        .eq("id", affiliateId)
        .select()
        .single();

      if (error) throw error;
      await logAdminAudit({
        actor,
        action: "AFFILIATE_UPDATE",
        entityType: "affiliate",
        entityId: affiliateId,
        after: updates,
      });

      return NextResponse.json({ success: true, affiliate: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[admin/affiliates] POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
