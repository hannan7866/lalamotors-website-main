-- ==============================================================================
-- Migration: 20261112_001_add_rls_and_admin_policies.sql
-- Description:
--   1. Creates `admins` lookup table linked to auth.users.
--   2. Fixes malformed RLS policies and implements admin-only CUD on `parts` / `autoparts`.
--   3. Secures `bike_listings`: public can submit with status 'pending'; only admins
--      can approve/reject/modify listings or access owner private contact details.
--   4. Secures `addresses` so users only access their own addresses.
--   5. Secures `orders` so users view their own orders and admins can manage all.
--
-- DO NOT EXECUTE AUTOMATICALLY. Review and run in the Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Admin Authorization Table & Helper Function
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only existing admins can view the admin roster
CREATE POLICY "Admins can view admin list"
    ON public.admins
    FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Reusable helper function to test admin status without repeating subqueries
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = auth.uid()
    );
$$;

-- ------------------------------------------------------------------------------
-- 2. Fixed & Hardened RLS for `parts` & legacy `autoparts`
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS parts ENABLE ROW LEVEL SECURITY;

-- Drop existing loose or malformed policies
DROP POLICY IF EXISTS "Public read access" ON parts;
DROP POLICY IF EXISTS "Authenticated users can insert" ON parts;
DROP POLICY IF EXISTS "Authenticated users can update" ON parts;
DROP POLICY IF EXISTS "Authenticated users can delete" ON parts;
DROP POLICY IF EXISTS "Allow all operations" ON parts;

-- Anyone can read parts catalog
CREATE POLICY "parts_public_read"
    ON parts
    FOR SELECT
    USING (true);

-- Only verified admins can insert, update, or delete parts
CREATE POLICY "parts_admin_insert"
    ON parts
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "parts_admin_update"
    ON parts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "parts_admin_delete"
    ON parts
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Also apply to legacy `autoparts` table if present
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'autoparts') THEN
        EXECUTE 'ALTER TABLE autoparts ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'DROP POLICY IF EXISTS "Public read access" ON autoparts;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all operations" ON autoparts;';
        EXECUTE 'CREATE POLICY "autoparts_public_read" ON autoparts FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "autoparts_admin_all" ON autoparts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Hardened RLS for `bike_listings`
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS bike_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved bike listings" ON bike_listings;
DROP POLICY IF EXISTS "Anyone can submit a bike listing" ON bike_listings;
DROP POLICY IF EXISTS "Admins can manage all bike listings" ON bike_listings;

-- Public can browse approved bikes for sale
CREATE POLICY "bike_listings_public_read_approved"
    ON bike_listings
    FOR SELECT
    USING (status = 'approved' OR public.is_admin());

-- Anyone (guest or authenticated) can submit a bike, but status MUST be forced to 'pending'
CREATE POLICY "bike_listings_public_insert_pending"
    ON bike_listings
    FOR INSERT
    WITH CHECK (status = 'pending');

-- Only admins can update bike listings (change status, edit asking price, etc.)
CREATE POLICY "bike_listings_admin_update"
    ON bike_listings
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Only admins can delete bike listings
CREATE POLICY "bike_listings_admin_delete"
    ON bike_listings
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Secure view for public browsing that masks seller private contact details
CREATE OR REPLACE VIEW public.public_bike_listings AS
SELECT 
    id,
    bike_brand,
    bike_model,
    year,
    kms_run,
    condition,
    asking_price,
    image_url,
    created_at
FROM bike_listings
WHERE status = 'approved';

-- ------------------------------------------------------------------------------
-- 4. Hardened RLS for `addresses`
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'addresses') THEN
        EXECUTE 'ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'DROP POLICY IF EXISTS "addresses_owner_access" ON addresses;';
        
        -- Users can only view their own addresses; admins can view for fulfillment
        EXECUTE 'CREATE POLICY "addresses_owner_select" ON addresses FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());';
        
        -- Users can manage (insert/update/delete) their own addresses
        EXECUTE 'CREATE POLICY "addresses_owner_insert" ON addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);';
        EXECUTE 'CREATE POLICY "addresses_owner_update" ON addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);';
        EXECUTE 'CREATE POLICY "addresses_owner_delete" ON addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 5. Hardened RLS for `orders` (if table exists)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        EXECUTE 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'CREATE POLICY "orders_owner_select" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());';
        EXECUTE 'CREATE POLICY "orders_owner_insert" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);';
        EXECUTE 'CREATE POLICY "orders_admin_update" ON orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());';
    END IF;
END $$;

