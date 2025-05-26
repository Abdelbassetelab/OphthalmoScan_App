-- Add patient_username column to scan_requests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'scan_requests'
        AND column_name = 'patient_username'
    ) THEN
        ALTER TABLE scan_requests ADD COLUMN patient_username TEXT;
    END IF;
END
$$;

-- Create index for patient_username
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'scan_requests'
        AND indexname = 'idx_scan_requests_patient_username'
    ) THEN
        CREATE INDEX idx_scan_requests_patient_username ON scan_requests(patient_username);
    END IF;
END
$$;

-- Update RLS policies to ensure they work with patient_username
DO $$
BEGIN
    -- Just make sure we don't have issues with existing policies
    DROP POLICY IF EXISTS "Users can update their own requests" ON scan_requests;
    
    -- Create policy for updating own requests (ensures patients can update patient_username)
    CREATE POLICY "Users can update their own requests"
      ON scan_requests FOR UPDATE
      USING (
        patient_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND (role = 'admin' OR role = 'doctor')
        )
      );
END
$$;
