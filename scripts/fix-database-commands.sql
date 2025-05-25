# Run this command in a terminal with psql installed:
# 
# Replace these values with your actual Supabase database credentials:
# - yourproject.supabase.co = your Supabase project host
# - yourpassword = your database password
# - 5432 = PostgreSQL port (usually 5432)
# - postgres = default database name
#
# psql -h yourproject.supabase.co -U postgres -d postgres -p 5432

# If you're using Supabase, the host will be: db.{PROJECT_ID}.supabase.co
# You can find your database password in the Supabase dashboard under Project Settings > Database

# Once connected, run these SQL commands:

ALTER TABLE scan_requests 
  ALTER COLUMN patient_id DROP NOT NULL;

-- Add clerk_user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'scan_requests'
        AND column_name = 'clerk_user_id'
    ) THEN
        ALTER TABLE scan_requests ADD COLUMN clerk_user_id TEXT;
    END IF;
END
$$;

-- Create index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'scan_requests'
        AND indexname = 'idx_scan_requests_clerk_user_id'
    ) THEN
        CREATE INDEX idx_scan_requests_clerk_user_id ON scan_requests(clerk_user_id);
    END IF;
END
$$;

-- Update RLS policies
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE scan_requests ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view their own scan requests" ON scan_requests;
    DROP POLICY IF EXISTS "Patients can create their own scan requests" ON scan_requests;
    DROP POLICY IF EXISTS "Patients can create requests" ON scan_requests;
    DROP POLICY IF EXISTS "Patients can view own requests" ON scan_requests;
    
    -- Create new policies
    CREATE POLICY "Users can view their own scan requests"
      ON scan_requests FOR SELECT
      USING (
        clerk_user_id::text = auth.uid()::text OR 
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND (role = 'admin' OR role = 'doctor')
        )
      );

    CREATE POLICY "Patients can create their own scan requests"
      ON scan_requests FOR INSERT
      WITH CHECK (true); -- Since we're using service role
END
$$;
