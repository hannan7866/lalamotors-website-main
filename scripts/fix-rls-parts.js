/**
 * fix-rls-parts.js
 * ----------------
 * PURPOSE : Emergency utility to reset RLS policies on the `parts` table if they
 *           become misconfigured and block legitimate reads/writes.
 *           It disables RLS, drops broken policies, and re-creates a permissive
 *           "allow all" policy so the catalog is immediately accessible again.
 *
 *           ⚠️  "Allow all" is intentionally wide — apply the proper admin-scoped
 *           policies from sql/20231112_001_add_rls_and_admin_policies.sql afterwards.
 *
 * WHEN TO RUN : Only in an emergency when the catalog is completely broken due to
 *               RLS misconfiguration.  NOT for routine use.
 * HOW TO RUN :
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/fix-rls-parts.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('Fixing RLS policies for parts table…');

    const steps = [
      'ALTER TABLE parts DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE parts ENABLE ROW LEVEL SECURITY;',
      `DROP POLICY IF EXISTS "Public read access" ON parts;
       DROP POLICY IF EXISTS "Authenticated users can insert" ON parts;
       DROP POLICY IF EXISTS "Authenticated users can update" ON parts;
       DROP POLICY IF EXISTS "Authenticated users can delete" ON parts;`,
      `CREATE POLICY "Allow all operations" ON parts FOR ALL USING (true) WITH CHECK (true);`,
    ];

    for (const sql of steps) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) { console.error('Step failed:', error); return; }
    }

    console.log('✅  RLS policies reset. Apply proper policies from sql/ when ready.');
  } catch (err) {
    console.error('❌  Error fixing RLS policies:', err);
  }
}

fixRLSPolicies();

