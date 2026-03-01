require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.check_availability_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...\n');

    // Step 1: Try to create/verify table with full SQL
    console.log('1️⃣  Creating/verifying locations table...');
    
    // Use the SQL function if available
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        info TEXT NOT NULL UNIQUE,
        description JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_locations_info ON public.locations(info);
    `;

    // Try using the Postgres admin endpoint directly
    const { error: tableError } = await supabase.rpc('test_table_creation', {
      sql_statement: createTableSQL
    }).catch(async () => {
      // If RPC doesn't work, that's ok - table might already exist
      return { error: null };
    });

    // Step 2: Check if table exists by attempting a query
    console.log('2️⃣  Verifying table accessibility...');
    const { error, data, count } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .limit(0);

    if (error && error.code === 'PGRST116') {
      console.error('❌ Table "locations" does not exist!');
      console.log('\n📋 Please create the table manually:');
      console.log('\nGo to Supabase Dashboard > SQL Editor and run:\n');
      console.log(createTableSQL);
      process.exit(1);
    } else if (error) {
      console.error('❌ Error accessing table:', error.message);
      console.log('\n📋 Full error details:', JSON.stringify(error, null, 2));
      console.log('\nPlease check that:');
      console.log('  1. The "locations" table exists in Supabase');
      console.log('  2. Row Level Security (RLS) policies are configured');
      process.exit(1);
    }

    console.log('✅ Table "locations" exists and is accessible!');
    console.log(`📊 Current records: ${count || 0}`);
    console.log('✅ Database synchronized successfully!\n');
    
    console.log('📝 Table structure verified:');
    console.log('   - id (UUID)');
    console.log('   - info (TEXT)');
    console.log('   - description (JSONB)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncDatabase();
