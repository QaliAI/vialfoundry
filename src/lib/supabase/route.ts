import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for API routes.
 * Prefers the service-role key (bypasses RLS for reliable writes); falls back to
 * the anon key, which is allowed to INSERT into public form tables via RLS policies.
 * Returns null when Supabase is not configured, so routes can degrade gracefully.
 */
export function createRouteClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('placeholder')) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
