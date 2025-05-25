-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own scan requests" ON scan_requests;
DROP POLICY IF EXISTS "Users can create scan requests" ON scan_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON scan_requests;
DROP POLICY IF EXISTS "Doctors can view all scan requests" ON scan_requests;
DROP POLICY IF EXISTS "Doctors can update any scan request" ON scan_requests;

-- Enable RLS
ALTER TABLE scan_requests ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view their own scan requests"
ON scan_requests FOR SELECT
USING (auth.uid() IN (user_id, patient_id));

CREATE POLICY "Users can create scan requests"
ON scan_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
ON scan_requests FOR UPDATE
USING (auth.uid() IN (user_id, patient_id) AND status = 'pending')
WITH CHECK (auth.uid() IN (user_id, patient_id) AND status = 'pending');

CREATE POLICY "Doctors can view all scan requests"
ON scan_requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id
        AND auth.users.raw_user_meta_data->>'role' = 'doctor'
    )
);

CREATE POLICY "Doctors can update any scan request"
ON scan_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = auth.users.id
        AND auth.users.raw_user_meta_data->>'role' = 'doctor'
    )
);
