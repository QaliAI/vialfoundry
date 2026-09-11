/**
 * Whether the dedicated Supabase project is actually configured.
 * Placeholder URL/key used in local stubs do NOT count.
 */
export function isSupabaseOperational(env = process.env) {
  const url = typeof env.NEXT_PUBLIC_SUPABASE_URL === "string" ? env.NEXT_PUBLIC_SUPABASE_URL.trim() : "";
  const key = typeof env.SUPABASE_SERVICE_ROLE_KEY === "string" ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : "";
  if (!url || !key) return false;
  if (/placeholder/i.test(url) || /placeholder/i.test(key)) return false;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co/i.test(url)) return false;
  return true;
}

export function isProductionRuntime(env = process.env) {
  return env.VERCEL_ENV === "production";
}
