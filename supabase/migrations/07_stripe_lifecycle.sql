-- 07_stripe_lifecycle.sql
-- Stripe TEST/LIVE label, checkout expiry, inventory decrement idempotency.
--
-- Inventory policy is decrement-on-payment (see src/lib/admin/inventory.mjs).
-- These timestamps make webhook retries safe: a second delivery cannot
-- decrement or restock twice.

ALTER TABLE public.manual_orders
  ADD COLUMN IF NOT EXISTS stripe_livemode BOOLEAN,
  ADD COLUMN IF NOT EXISTS inventory_decremented_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inventory_restocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkout_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.manual_orders.stripe_livemode IS
  'true = Stripe live mode, false = Stripe test mode, null = not a Stripe order. Stored on the order so admin never confuses test revenue with live revenue after a later environment switch.';

COMMENT ON COLUMN public.manual_orders.inventory_decremented_at IS
  'Set once when confirmed payment decrements on-hand stock. Null means stock has not been taken for this order.';

COMMENT ON COLUMN public.manual_orders.inventory_restocked_at IS
  'Set once when a full refund returns stock. Partial refunds do not restock.';
