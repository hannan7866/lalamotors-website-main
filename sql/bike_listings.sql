-- SQL to create the bike_listings table for Lala Motors
CREATE TABLE IF NOT EXISTS bike_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    phone_number text NOT NULL,
    email text NOT NULL,
    bike_brand text NOT NULL,
    bike_model text NOT NULL,
    year integer NOT NULL,
    kms_run integer NOT NULL,
    condition text NOT NULL,
    asking_price integer NOT NULL,
    image_url text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc', now())
); 