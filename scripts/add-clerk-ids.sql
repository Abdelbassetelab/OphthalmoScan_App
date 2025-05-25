-- Add Clerk user_id column to scan_requests table
ALTER TABLE scan_requests
ADD COLUMN clerk_user_id TEXT,
ADD COLUMN clerk_doctor_id TEXT;

-- Create index for the new columns
CREATE INDEX idx_scan_requests_clerk_user_id ON scan_requests(clerk_user_id);
CREATE INDEX idx_scan_requests_clerk_doctor_id ON scan_requests(clerk_doctor_id);

-- Update RLS policies to use Clerk user IDs
DROP POLICY IF EXISTS "Patients can view own requests" ON scan_requests;
CREATE POLICY "Patients can view own requests"
    ON scan_requests FOR SELECT
    USING (clerk_user_id = auth.jwt()->>'sub');

DROP POLICY IF EXISTS "Patients can create requests" ON scan_requests;
CREATE POLICY "Patients can create requests"
    ON scan_requests FOR INSERT
    WITH CHECK (clerk_user_id = auth.jwt()->>'sub');

DROP POLICY IF EXISTS "Patients can update own pending requests" ON scan_requests;
CREATE POLICY "Patients can update own pending requests"
    ON scan_requests FOR UPDATE
    USING (clerk_user_id = auth.jwt()->>'sub' AND status = 'pending');

DROP POLICY IF EXISTS "Doctors can view assigned requests" ON scan_requests;
CREATE POLICY "Doctors can view assigned requests"
    ON scan_requests FOR SELECT
    USING (
        clerk_doctor_id = auth.jwt()->>'sub'
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.jwt()->>'sub' = clerk_user_id 
            AND raw_user_meta_data->>'role' = 'doctor'
        )
    );
