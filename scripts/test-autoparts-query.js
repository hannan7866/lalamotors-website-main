/**
 * test-autoparts-query.js
 * ----------------------
 * PURPOSE : Verifies that the Supabase `parts` table is reachable and returns data.
 * WHEN TO RUN : Locally only, after a schema change or if the catalog page stops loading.
 * HOW TO RUN : SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/test-autoparts-query.js
 *
 * ⚠️  Uses env vars — do NOT hard-code keys here.
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

async function testAutopartsQuery() {
  try {
    console.log('Testing parts table query…');

    const { data, error } = await supabase.from('parts').select('*').limit(5);

    if (error) {
      console.error('Error querying parts table:', error);
    } else {
      console.log(`✅  Parts table query successful: ${data.length} records found`);
      console.log('Sample data:', data.slice(0, 2));
    }

    const { count, error: countError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting parts:', countError);
    } else {
      console.log(`📊  Total parts records: ${count}`);
    }
  } catch (err) {
    console.error('❌  Test failed:', err);
  }
}

testAutopartsQuery();

