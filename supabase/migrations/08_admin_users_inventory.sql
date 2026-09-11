-- 08_admin_users_inventory.sql
-- Multi-admin passwordless login + atomic inventory delta.

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.admin_login_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_login_tokens_user_idx
  ON public.admin_login_tokens (admin_user_id, created_at DESC);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_tokens ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_users (email, name, role, active)
VALUES
  ('rubixaico@gmail.com', 'Rubin', 'owner', true),
  ('jrhawkins47@gmail.com', 'Jessica Hawkins', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    active = true;

-- Atomic inventory change with a row lock. p_delta is negative for a sale.
CREATE OR REPLACE FUNCTION public.apply_inventory_delta(p_id text, p_delta integer)
RETURNS TABLE(previous_quantity integer, new_quantity integer) AS $$
DECLARE
  prev integer;
  nextq integer;
BEGIN
  SELECT inventory_quantity INTO prev
  FROM public.products
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  nextq := GREATEST(0, COALESCE(prev, 0) + COALESCE(p_delta, 0));
  UPDATE public.products
     SET inventory_quantity = nextq,
         updated_at = NOW()
   WHERE id = p_id;

  previous_quantity := COALESCE(prev, 0);
  new_quantity := nextq;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
