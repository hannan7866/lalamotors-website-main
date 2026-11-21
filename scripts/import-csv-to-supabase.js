/**
 * import-csv-to-supabase.js
 * -------------------------
 * PURPOSE : One-time seeding script — parses the spare-parts CSV and bulk-inserts
 *           every row into the Supabase `parts` table.
 * WHEN TO RUN : Only when you need to (re)seed the parts catalog from the CSV.
 *               DESTRUCTIVE — it deletes all existing parts rows first!
 * HOW TO RUN :
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/import-csv-to-supabase.js
 *   OR just:  node scripts/import-csv-to-supabase.js  (reads from .env)
 *
 * ⚠️  Credentials come from env vars — never hard-code them here.
 * ⚠️  Prices and quantities in the CSV are assigned random values as placeholders.
 *     Update them in Supabase after import.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCSVToSupabase() {
  try {
    console.log('Starting CSV import to Supabase…');

    const csvPath = path.join(__dirname, '..', 'Complete_Motorcycle_Spare_Parts_List new.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');

    const lines = csvData.split('\n').slice(1); // skip header
    const parts = [];

    console.log(`Processing ${lines.length} lines from CSV…`);

    lines.forEach((line, index) => {
      if (!line.trim()) return;

      const [brand, model, category, name] = line.split(',').map((item) => item.trim());

      if (!brand || !model || !category || !name) {
        console.warn(`Skipping incomplete row at line ${index + 2}:`, { brand, model, category, name });
        return;
      }

      parts.push({
        brand,
        model,
        category,
        name,
        price: Math.floor(Math.random() * 5000) + 100,  // placeholder — update after import
        quantity: Math.floor(Math.random() * 50) + 1,   // placeholder — update after import
      });
    });

    console.log(`Prepared ${parts.length} parts for import`);

    // ⚠️  Clears the entire table before inserting
    console.log('Clearing existing data…');
    const { error: deleteError } = await supabase
      .from('parts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      return;
    }

    const batchSize = 100;
    for (let i = 0; i < parts.length; i += batchSize) {
      const batch = parts.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(parts.length / batchSize);
      console.log(`Inserting batch ${batchNum}/${totalBatches}…`);

      const { error } = await supabase.from('parts').insert(batch);
      if (error) {
        console.error('Error inserting batch:', error);
        return;
      }
      console.log(`  ✅  ${batch.length} parts inserted`);
    }

    console.log(`✅  CSV import completed. Total parts imported: ${parts.length}`);
  } catch (err) {
    console.error('❌  Error during import:', err);
  }
}

importCSVToSupabase();

