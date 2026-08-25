import { NextResponse } from "next/server";
import { resolveAffiliateReferral } from "../../../lib/affiliates/utils.mjs";
import { getAffiliateCookieConfig } from "../../../lib/affiliates/attribution.mjs";
import { logAffiliateClick } from "../../../lib/affiliates/tracking";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  const url = new URL(request.url);
  const resolved = resolveAffiliateReferral(code, {
    redirectTo: "/catalog",
  });

  const redirectTarget = resolved.redirectTo || "/catalog";
  const redirectUrl = new URL(redirectTarget, url.origin);

  // Preserve any additional UTM query parameters
  url.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  if (resolved.ok && resolved.code) {
    const cookieConfig = getAffiliateCookieConfig({ cookieName: "vf_ref_partner" });
    response.cookies.set(cookieConfig.name, resolved.code, {
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAge,
      sameSite: "lax",
      secure: cookieConfig.secure,
      httpOnly: cookieConfig.httpOnly,
    });

    // Log click asynchronously
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referer = request.headers.get("referer") || "direct";

    logAffiliateClick(code, {
      ipHash: ip.split(",")[0].trim(),
      userAgent,
      referer,
    });
  }

  return response;
}
