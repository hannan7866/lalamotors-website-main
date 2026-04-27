const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutopartsQuery() {
    try {
        console.log('Testing autoparts table query...');
        
        // Test querying parts table (new source)
        const { data: autopartsData, error: autopartsError } = await supabase
            .from('parts')
            .select('*')
            .limit(5);
        
        if (autopartsError) {
            console.error('Error querying autoparts table:', autopartsError);
        } else {
            console.log(`✅ Autoparts table query successful: ${autopartsData.length} records found`);
            console.log('Sample data:', autopartsData.slice(0, 2));
        }
        
        // Test querying parts table
        const { data: partsData, error: partsError } = await supabase
            .from('parts')
            .select('*')
            .limit(5);
        
        if (partsError) {
            console.error('Error querying parts table:', partsError);
        } else {
            console.log(`✅ Parts table query successful: ${partsData.length} records found`);
            console.log('Sample data:', partsData.slice(0, 2));
        }
        
        // Get total counts
        const { count: autopartsCount, error: autopartsCountError } = await supabase
            .from('parts')
            .select('*', { count: 'exact', head: true });
        
        if (autopartsCountError) {
            console.error('Error counting autoparts:', autopartsCountError);
        } else {
            console.log(`📊 Total autoparts records: ${autopartsCount}`);
        }
        
        const { count: partsCount, error: partsCountError } = await supabase
            .from('parts')
            .select('*', { count: 'exact', head: true });
        
        if (partsCountError) {
            console.error('Error counting parts:', partsCountError);
        } else {
            console.log(`📊 Total parts records: ${partsCount}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testAutopartsQuery(); 