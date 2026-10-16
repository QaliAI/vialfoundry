-- Minimal commerce schema before the migration, with the production column types.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
CREATE TABLE public.customers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text UNIQUE,first_name text,last_name text,company text,phone text);
CREATE TABLE public.affiliates(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.product_variants(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.products(id varchar(100) PRIMARY KEY, inventory_quantity integer, updated_at timestamptz DEFAULT now());
CREATE TABLE public.inventory_transactions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),product_id varchar(100) REFERENCES products(id),
  transaction_type varchar(50),quantity_change integer,previous_quantity integer,new_quantity integer,
  reason text,reference_id varchar(100),created_by varchar(100),created_at timestamptz DEFAULT now()
);
CREATE TABLE public.promotions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),code text UNIQUE,times_used integer DEFAULT 0,updated_at timestamptz DEFAULT now());
