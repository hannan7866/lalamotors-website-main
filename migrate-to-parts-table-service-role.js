const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with service role key (bypasses RLS)
const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
// Note: You'll need to replace this with your actual service role key from Supabase dashboard
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU5NTA0NiwiZXhwIjoyMDY2MTcxMDQ2fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateToPartsTable() {
    try {
        console.log('Starting migration from autoparts to parts table...');
        
        // Step 1: Get all data from autoparts table
        console.log('Fetching data from autoparts table...');
        const { data: autopartsData, error: fetchError } = await supabase
            .from('autoparts')
            .select('*');
        
        if (fetchError) {
            throw new Error(`Error fetching autoparts data: ${fetchError.message}`);
        }
        
        console.log(`Found ${autopartsData.length} records in autoparts table`);
        
        if (autopartsData.length === 0) {
            console.log('No data to migrate. Exiting...');
            return;
        }
        
        // Step 2: Transform data for new parts table
        console.log('Transforming data for new parts table...');
        const partsData = autopartsData.map(part => ({
            brand: part.brand,
            model: part.model,
            category: part.category,
            name: part.name,
            price: part.price,
            quantity: part.quantity,
            image_url: part.image_url,
            status: part.status || 'in_stock',
            // New fields will be auto-generated or have defaults
            description: null,
            weight: null,
            dimensions: null,
            manufacturer: null,
            warranty_months: 12,
            is_featured: false,
            is_bestseller: false,
            created_at: part.created_at,
            updated_at: part.updated_at
        }));
        
        console.log(`Transformed ${partsData.length} records`);
        
        // Step 3: Insert data into new parts table
        console.log('Inserting data into parts table...');
        const batchSize = 100;
        let successCount = 0;
        
        for (let i = 0; i < partsData.length; i += batchSize) {
            const batch = partsData.slice(i, i + batchSize);
            
            console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(partsData.length / batchSize)}...`);
            
            const { data, error } = await supabase
                .from('parts')
                .insert(batch);
            
            if (error) {
                console.error('Error inserting batch:', error);
                throw error;
            }
            
            successCount += batch.length;
            console.log(`Successfully inserted ${batch.length} records`);
        }
        
        console.log('✅ Migration completed successfully!');
        console.log(`Total records migrated: ${successCount}`);
        
        // Step 4: Verify migration
        console.log('Verifying migration...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('parts')
            .select('*');
        
        if (verifyError) {
            console.error('Error verifying migration:', verifyError);
        } else {
            console.log(`✅ Verification: ${verifyData.length} records in parts table`);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Run the migration
migrateToPartsTable(); 