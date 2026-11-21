/**
 * migrate-to-parts-table-service-role.js
 * ----------------------------------------
 * PURPOSE : Same migration as migrate-to-parts-table.js but uses the Supabase
 *           SERVICE ROLE key so it bypasses RLS.  Use this if the anon-key version
 *           fails due to RLS policies during the migration window.
 * WHEN TO RUN : Only once, as a fallback when the anon-key migration is blocked by RLS.
 * HOW TO RUN :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-parts-table-service-role.js
 *
 * ⚠️  The SERVICE ROLE key has full DB access — keep it secret.
 *     Never commit it; always pass it via env var or a secure secret store.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateToPartsTable() {
  try {
    console.log('Starting migration (service-role) from autoparts → parts table…');

    const { data: autopartsData, error: fetchError } = await supabase.from('autoparts').select('*');
    if (fetchError) throw new Error(`Error fetching autoparts data: ${fetchError.message}`);

    console.log(`Found ${autopartsData.length} records`);
    if (autopartsData.length === 0) { console.log('Nothing to migrate.'); return; }

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

    console.log(`✅  Migration complete. Total: ${successCount}`);

    const { count } = await supabase.from('parts').select('*', { count: 'exact', head: true });
    console.log(`📊  parts table now has ${count} records`);

  } catch (err) {
    console.error('❌  Migration failed:', err);
  }
}

migrateToPartsTable();

