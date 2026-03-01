require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.check_availability_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLS() {
  try {
    console.log('🔧 Setting up Row Level Security (RLS)...\n');

    // Disable RLS initially (allows anon access)
    console.log('1️⃣  Disabling RLS on locations table...');
    const { error: disableError } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .limit(0);

    // Get the SQL to disable RLS
    // Since we can't run raw SQL easily, we'll just show instructions
    console.log('✅ RLS configuration info:');
    console.log('\n📋 To enable RLS with proper policies, run this in Supabase Dashboard > SQL Editor:\n');
    
    const sql = `-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT (allow anyone to read)
CREATE POLICY "Allow public select on locations"
ON public.locations
FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy for INSERT (allow anyone to insert)
CREATE POLICY "Allow public insert on locations"
ON public.locations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policy for UPDATE (allow anyone to update)
CREATE POLICY "Allow public update on locations"
ON public.locations
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);`;

    console.log(sql);
    console.log('\n✅ RLS setup instructions displayed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupRLS();
