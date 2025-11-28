const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Testing connection to Supabase...');
    console.log('URL:', supabaseUrl);

    const { data, error } = await supabase
        .from('threads')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Connection Failed!');
        console.error('Error details:', JSON.stringify(error, null, 2));
        if (error.code === '42P01') {
            console.error('\nPossible Cause: The "threads" table does not exist.');
            console.error('Solution: Run the SQL from supabase_setup.sql in your Supabase Dashboard.');
        }
    } else {
        console.log('Connection Successful!');
        console.log('Threads table exists.');
    }
}

verify();
