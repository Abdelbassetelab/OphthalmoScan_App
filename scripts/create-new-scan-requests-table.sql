-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists
DROP TABLE IF EXISTS scan_requests;

-- Create scan_requests table with correct types
CREATE TABLE scan_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    patient_id TEXT NOT NULL, -- Using TEXT for Clerk user IDs
    user_id TEXT NOT NULL, -- Additional column for Clerk user IDs
    description TEXT NOT NULL,
    symptoms TEXT,
    medical_history TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_doctor_id TEXT, -- Using TEXT for Clerk doctor IDs
    completed_at TIMESTAMP WITH TIME ZONE,
    has_image BOOLEAN DEFAULT false,
    scan_id UUID,
    image_url TEXT,

    -- Add constraints
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'assigned', 'scheduled', 'completed', 'cancelled')),
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
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
ALTER TABLE scan_requests ENABLE ROW LEVEL_SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own scan requests"
    ON scan_requests FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = patient_id);

CREATE POLICY "Users can create their own scan requests"
    ON scan_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending scan requests"
    ON scan_requests FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

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
