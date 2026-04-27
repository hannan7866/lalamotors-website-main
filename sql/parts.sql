-- Create enum type for part status
CREATE TYPE part_status AS ENUM ('in_stock', 'out_of_stock', 'discontinued');

-- Create the parts table (new table)
CREATE TABLE parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    status part_status DEFAULT 'in_stock',
    sku TEXT UNIQUE,
    weight DECIMAL(8,2),
    dimensions TEXT,
    manufacturer TEXT,
    warranty_months INTEGER DEFAULT 12,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_parts_brand_model ON parts(brand, model);
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_featured ON parts(is_featured);
CREATE INDEX idx_parts_bestseller ON parts(is_bestseller);
CREATE INDEX idx_parts_sku ON parts(sku);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
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

CREATE TRIGGER update_parts_status
    BEFORE INSERT OR UPDATE OF quantity ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_part_status();

-- Create a function to generate SKU
CREATE OR REPLACE FUNCTION generate_sku()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sku IS NULL THEN
        NEW.sku := UPPER(LEFT(NEW.brand, 3) || '-' || LEFT(NEW.model, 3) || '-' || 
                      LEFT(NEW.category, 3) || '-' || RIGHT(NEW.id::text, 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_parts_sku
    BEFORE INSERT ON parts
    FOR EACH ROW
    EXECUTE FUNCTION generate_sku();

-- Enable Row Level Security (RLS)
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access
CREATE POLICY "Public read access" ON parts
    FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert" ON parts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own records
CREATE POLICY "Authenticated users can update" ON parts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own records
CREATE POLICY "Authenticated users can delete" ON parts
    FOR DELETE USING (auth.role() = 'authenticated'); 