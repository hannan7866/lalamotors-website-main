const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCSVToSupabase() {
    try {
        console.log('Starting CSV import to Supabase...');
        
        // Read the CSV file
        const csvPath = './Complete_Motorcycle_Spare_Parts_List new.csv';
        const csvData = fs.readFileSync(csvPath, 'utf8');
        
        // Parse CSV data
        const lines = csvData.split('\n').slice(1); // Skip header row
        const parts = [];
        
        console.log(`Processing ${lines.length} lines from CSV...`);
        
        lines.forEach((line, index) => {
            if (!line.trim()) return;
            
            const [brand, model, category, name] = line.split(',').map(item => item.trim());
            
            if (!brand || !model || !category || !name) {
                console.warn(`Skipping incomplete data at line ${index + 2}:`, { brand, model, category, name });
                return;
            }
            
            // Create part object for Supabase (without status field for now)
            const part = {
                brand: brand,
                model: model,
                category: category,
                name: name,
                price: Math.floor(Math.random() * 5000) + 100, // Random price between 100-5100
                quantity: Math.floor(Math.random() * 50) + 1 // Random quantity between 1-50
            };
            
            parts.push(part);
        });
        
        console.log(`Prepared ${parts.length} parts for import`);
        
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('Clearing existing data...');
        const { error: deleteError } = await supabase
            .from('parts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
        
        if (deleteError) {
            console.error('Error clearing existing data:', deleteError);
            return;
        }
        
        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < parts.length; i += batchSize) {
            const batch = parts.slice(i, i + batchSize);
            
            console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(parts.length / batchSize)}...`);
            
            const { data, error } = await supabase
                .from('parts')
                .insert(batch);
            
            if (error) {
                console.error('Error inserting batch:', error);
                return;
            }
            
            console.log(`Successfully inserted ${batch.length} parts`);
        }
        
        console.log('✅ CSV import completed successfully!');
        console.log(`Total parts imported: ${parts.length}`);
        
    } catch (error) {
        console.error('❌ Error during import:', error);
    }
}

// Run the import
importCSVToSupabase(); 