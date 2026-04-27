const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
    try {
        console.log('Fixing RLS policies for parts table...');
        
        // Disable RLS temporarily
        const { error: disableError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE parts DISABLE ROW LEVEL SECURITY;'
        });
        
        if (disableError) {
            console.error('Error disabling RLS:', disableError);
            return;
        }
        
        console.log('✅ RLS disabled successfully');
        
        // Re-enable RLS
        const { error: enableError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE parts ENABLE ROW LEVEL SECURITY;'
        });
        
        if (enableError) {
            console.error('Error re-enabling RLS:', enableError);
            return;
        }
        
        // Drop existing policies
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: 'DROP POLICY IF EXISTS "Public read access" ON parts; DROP POLICY IF EXISTS "Authenticated users can insert" ON parts; DROP POLICY IF EXISTS "Authenticated users can update" ON parts; DROP POLICY IF EXISTS "Authenticated users can delete" ON parts;'
        });
        
        if (dropError) {
            console.error('Error dropping policies:', dropError);
            return;
        }
        
        // Create new policies that allow all operations
        const { error: createError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE POLICY "Allow all operations" ON parts
                FOR ALL USING (true) WITH CHECK (true);
            `
        });
        
        if (createError) {
            console.error('Error creating new policy:', createError);
            return;
        }
        
        console.log('✅ RLS policies fixed successfully');
        
    } catch (error) {
        console.error('❌ Error fixing RLS policies:', error);
    }
}

// Run the fix
fixRLSPolicies(); 