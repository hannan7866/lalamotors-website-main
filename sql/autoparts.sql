-- Create enum type for part status
CREATE TYPE part_status AS ENUM ('in_stock', 'out_of_stock');

-- Create the autoparts table
CREATE TABLE autoparts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    status part_status DEFAULT 'in_stock',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on brand and model for faster searches
CREATE INDEX idx_autoparts_brand_model ON autoparts(brand, model);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_autoparts_updated_at
    BEFORE UPDATE ON autoparts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a trigger to automatically update status based on quantity
CREATE OR REPLACE FUNCTION update_part_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity <= 0 THEN
        NEW.status = 'out_of_stock';
    ELSE
        NEW.status = 'in_stock';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_autoparts_status
    BEFORE INSERT OR UPDATE OF quantity ON autoparts
    FOR EACH ROW
    EXECUTE FUNCTION update_part_status(); 