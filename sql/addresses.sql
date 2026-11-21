-- addresses.sql
-- -------------
-- STATUS: NOT YET APPLIED. The address feature UI exists in services/address.html
--         but the form submit is a placeholder (no DB persistence yet).
--
-- Apply this migration when you are ready to implement saved addresses.
-- After applying, wire up services/address.js to the Supabase client.

CREATE TABLE IF NOT EXISTS addresses (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label       TEXT NOT NULL CHECK (char_length(label) <= 30),   -- 'Home', 'Office', etc.
    line1       TEXT NOT NULL CHECK (char_length(line1) <= 100),
    line2       TEXT CHECK (char_length(line2) <= 100),
    city        TEXT NOT NULL CHECK (char_length(city) <= 60),
    state       TEXT NOT NULL CHECK (char_length(state) <= 60),
    pincode     TEXT NOT NULL CHECK (pincode ~ '^\d{6}$'),         -- Indian 6-digit PIN
    is_default  BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default
    ON addresses (user_id)
    WHERE is_default = true;

-- Enable RLS (policies defined in 20231112_001_add_rls_and_admin_policies.sql)
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

