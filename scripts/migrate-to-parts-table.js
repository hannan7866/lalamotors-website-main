/**
 * migrate-to-parts-table.js
 * -------------------------
 * PURPOSE : One-time data migration — copies all rows from the legacy `autoparts`
 *           table into the new `parts` table, mapping columns as needed.
 * WHEN TO RUN : Only once, after the new `parts` table has been created via
 *               sql/parts.sql and before the old `autoparts` table is dropped.
 * HOW TO RUN :
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/migrate-to-parts-table.js
 *
 * ⚠️  Credentials come from env vars — never hard-code them here.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateToPartsTable() {
  try {
    console.log('Starting migration from autoparts → parts table…');

    const { data: autopartsData, error: fetchError } = await supabase.from('autoparts').select('*');
    if (fetchError) throw new Error(`Error fetching autoparts data: ${fetchError.message}`);

    console.log(`Found ${autopartsData.length} records in autoparts table`);
    if (autopartsData.length === 0) { console.log('Nothing to migrate. Exiting.'); return; }

    const partsData = autopartsData.map((part) => ({
      brand: part.brand,
      model: part.model,
      category: part.category,
      name: part.name,
      price: part.price,
      quantity: part.quantity,
      image_url: part.image_url,
      status: part.status || 'in_stock',
      description: null,
      weight: null,
      dimensions: null,
      manufacturer: null,
      warranty_months: 12,
      is_featured: false,
      is_bestseller: false,
      created_at: part.created_at,
      updated_at: part.updated_at,
    }));

    const batchSize = 100;
    let successCount = 0;

    for (let i = 0; i < partsData.length; i += batchSize) {
      const batch = partsData.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(partsData.length / batchSize);
      console.log(`Inserting batch ${batchNum}/${totalBatches}…`);

      const { error } = await supabase.from('parts').insert(batch);
      if (error) { console.error('Error inserting batch:', error); throw error; }

      successCount += batch.length;
    }

    console.log(`✅  Migration complete. Total records migrated: ${successCount}`);

    // Verify
    const { count, error: countError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true });
    if (countError) console.error('Verification error:', countError);
    else console.log(`📊  parts table now has ${count} records`);

  } catch (err) {
    console.error('❌  Migration failed:', err);
  }
}

migrateToPartsTable();

