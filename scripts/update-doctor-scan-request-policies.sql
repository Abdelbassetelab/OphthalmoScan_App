-- Update RLS policies to allow doctors to see all scan requests
-- First, drop the existing doctor policy
DROP POLICY IF EXISTS "Doctors can view assigned requests" ON scan_requests;

-- Create a new policy that allows doctors to view all scan requests
CREATE POLICY "Doctors can view all scan requests"
    ON scan_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'doctor' OR
                auth.users.raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- Keep the existing update policy which only allows doctors to update their assigned requests
-- This ensures doctors can only modify requests assigned to them, even though they can view all
