/**
 * address.js
 * ----------
 * STATUS: PLACEHOLDER — not yet wired to address.html or Supabase.
 *
 * address.html currently uses only inline JS (via script.js) and shows a UI-only
 * form with a TODO comment: "Logic to save the address would go here".
 * The sql/addresses.sql schema is also empty (no table defined yet).
 *
 * PLAN (when you are ready to implement):
 *  1. Define the `addresses` table in sql/addresses.sql (see schema below).
 *  2. Add RLS policies from sql/20231112_001_add_rls_and_admin_policies.sql.
 *  3. Replace the form submit handler in address.html with the functions below.
 *
 * REQUIRED sql/addresses.sql schema:
 *   CREATE TABLE addresses (
 *       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *       label TEXT NOT NULL,          -- e.g. 'Home', 'Office'
 *       line1 TEXT NOT NULL,
 *       line2 TEXT,
 *       city TEXT NOT NULL,
 *       state TEXT NOT NULL,
 *       pincode TEXT NOT NULL,
 *       is_default BOOLEAN DEFAULT false,
 *       created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
 *   -- Users can only see/edit their own addresses (see migration SQL for policies)
 */

// This file is intentionally left without executable code until the
// addresses table and RLS policies have been applied in Supabase.
// See the plan above.

