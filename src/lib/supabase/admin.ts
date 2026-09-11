import { createClient } from '@supabase/supabase-js';
import { isSupabaseOperational } from './operational.mjs';

export function createAdminClient() {
  if (!isSupabaseOperational()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
