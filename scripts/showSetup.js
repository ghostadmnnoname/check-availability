require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🚀 Complete Setup Instructions for Supabase\n');
console.log('=' .repeat(60));

const setupSQL = `-- =============================================
-- 1. CREATE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  info TEXT NOT NULL UNIQUE,
  description JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_locations_info ON public.locations(info);

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE RLS POLICIES
-- =============================================

-- Policy for SELECT - allow anyone to read
CREATE POLICY "Allow public select on locations"
ON public.locations
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for INSERT - allow anyone to insert
DROP POLICY IF EXISTS "Allow public insert on locations" ON public.locations;
CREATE POLICY "Allow public insert on locations"
ON public.locations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy for UPDATE - allow anyone to update
DROP POLICY IF EXISTS "Allow public update on locations" ON public.locations;
CREATE POLICY "Allow public update on locations"
ON public.locations
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy for DELETE - allow anyone to delete
DROP POLICY IF EXISTS "Allow public delete on locations" ON public.locations;
CREATE POLICY "Allow public delete on locations"
ON public.locations
FOR DELETE
TO anon, authenticated
USING (true);`;

console.log('\n📋 COPY & PASTE THIS SQL IN SUPABASE DASHBOARD:\n');
console.log('Go to: Supabase Dashboard > SQL Editor > New Query\n');
console.log(setupSQL);
console.log('\n' + '='.repeat(60));
console.log('\n✅ After running the SQL above:');
console.log('   1. Click "Execute" button');
console.log('   2. Wait for success message');
console.log('   3. Return to your terminal and run: npm run dev');
console.log('\n🔗 Supabase Dashboard: https://app.supabase.com/');
console.log('\n');

// Save to file for easy copying
const setupFile = path.join(__dirname, '../SUPABASE_SETUP.sql');
fs.writeFileSync(setupFile, setupSQL);
console.log(`✅ SQL saved to: SUPABASE_SETUP.sql`);
