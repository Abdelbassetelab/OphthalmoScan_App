-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists
DROP TABLE IF EXISTS scan_requests;

-- Create scan_requests table
CREATE TABLE scan_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    patient_id UUID NOT NULL,
    description TEXT NOT NULL,
    symptoms TEXT,
    medical_history TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_doctor_id UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    has_image BOOLEAN DEFAULT false,
    scan_id UUID,

    -- Add constraints
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'assigned', 'scheduled', 'completed', 'cancelled')),
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor FOREIGN KEY (assigned_doctor_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scan_requests_updated_at
    BEFORE UPDATE ON scan_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE scan_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Patients can view their own scan requests"
    ON scan_requests FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own scan requests"
    ON scan_requests FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view assigned requests"
    ON scan_requests FOR SELECT
    USING (auth.uid() = assigned_doctor_id);

CREATE POLICY "Doctors can update assigned requests"
    ON scan_requests FOR UPDATE
    USING (auth.uid() = assigned_doctor_id);

CREATE POLICY "Admins have full access"
    ON scan_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_scan_requests_patient_id ON scan_requests(patient_id);
CREATE INDEX idx_scan_requests_assigned_doctor_id ON scan_requests(assigned_doctor_id);
CREATE INDEX idx_scan_requests_status ON scan_requests(status);
CREATE INDEX idx_scan_requests_created_at ON scan_requests(created_at);

-- Grant necessary permissions
GRANT ALL ON scan_requests TO authenticated;
GRANT USAGE ON SEQUENCE scan_requests_id_seq TO authenticated;
