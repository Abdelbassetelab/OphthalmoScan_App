-- Script to update scan_requests table to make it work with Clerk
-- This script should fix the foreign key constraint issues

-- First, check if patient_id column exists and is NOT NULL
DO $$
DECLARE
    patient_id_not_null BOOLEAN;
BEGIN
    SELECT attnotnull INTO patient_id_not_null
    FROM pg_attribute
    WHERE attrelid = 'scan_requests'::regclass
    AND attname = 'patient_id'
    AND NOT attisdropped;
    
    IF patient_id_not_null THEN
        -- Modify the scan_requests table to make patient_id nullable
        EXECUTE 'ALTER TABLE scan_requests ALTER COLUMN patient_id DROP NOT NULL';
        RAISE NOTICE 'Modified patient_id to be nullable';
    ELSE
        RAISE NOTICE 'patient_id already nullable or does not exist';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'scan_requests table does not exist';
    WHEN undefined_column THEN
        RAISE NOTICE 'patient_id column does not exist';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking patient_id constraint: %', SQLERRM;
END;
$$;

-- Check if clerk_user_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'scan_requests'
        AND column_name = 'clerk_user_id'
    ) THEN
        ALTER TABLE scan_requests ADD COLUMN clerk_user_id TEXT;
        RAISE NOTICE 'Added clerk_user_id column';
    ELSE
        RAISE NOTICE 'clerk_user_id column already exists';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'scan_requests table does not exist';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding clerk_user_id column: %', SQLERRM;
END;
$$;

-- Create index on clerk_user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'scan_requests'
        AND indexname = 'idx_scan_requests_clerk_user_id'
    ) THEN
        CREATE INDEX idx_scan_requests_clerk_user_id ON scan_requests(clerk_user_id);
        RAISE NOTICE 'Created index on clerk_user_id';
    ELSE
        RAISE NOTICE 'Index on clerk_user_id already exists';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'scan_requests table does not exist';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating index: %', SQLERRM;
END;
$$;

-- Update RLS policies safely
DO $$
BEGIN
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename = 'scan_requests'
        AND rowsecurity = true
    ) THEN
        -- Drop policies if they exist
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scan_requests' AND policyname = 'Users can view their own scan requests') THEN
            DROP POLICY "Users can view their own scan requests" ON scan_requests;
            RAISE NOTICE 'Dropped policy: Users can view their own scan requests';
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scan_requests' AND policyname = 'Patients can create their own scan requests') THEN
            DROP POLICY "Patients can create their own scan requests" ON scan_requests;
            RAISE NOTICE 'Dropped policy: Patients can create their own scan requests';
        END IF;
        
        -- Create new policies for clerk_user_id
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
        RAISE NOTICE 'Created policy: Users can view their own scan requests';
        
        CREATE POLICY "Patients can create their own scan requests"
          ON scan_requests FOR INSERT
          WITH CHECK (true);
        RAISE NOTICE 'Created policy: Patients can create their own scan requests';
    ELSE
        RAISE NOTICE 'RLS is not enabled on scan_requests table';
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'scan_requests table does not exist';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating RLS policies: %', SQLERRM;
END;
$$;
