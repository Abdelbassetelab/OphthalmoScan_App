-- First drop existing table and related objects
DROP TABLE IF EXISTS scan_requests CASCADE;

-- Create enum for scan request status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scan_request_status') THEN
        CREATE TYPE scan_request_status AS ENUM (
            'pending',
            'assigned',
            'scheduled',
            'completed',
            'cancelled'
        );
    END IF;
END$$;

-- Create enum for priority
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scan_request_priority') THEN
        CREATE TYPE scan_request_priority AS ENUM (
            'low',
            'medium',
            'high',
            'urgent'
        );
    END IF;
END$$;

-- Create scan_requests table with improved structure
CREATE TABLE scan_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES auth.users(id),
    description TEXT NOT NULL,
    symptoms TEXT,
    medical_history TEXT,
    status scan_request_status DEFAULT 'pending' NOT NULL,
    priority scan_request_priority DEFAULT 'medium' NOT NULL,
    completed_at TIMESTAMPTZ,
    scan_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Add user-specific metadata for easier querying
    patient_email TEXT,
    patient_name TEXT,
    doctor_email TEXT,
    doctor_name TEXT,
    
    CONSTRAINT fk_patient_user 
        FOREIGN KEY (patient_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_doctor_user 
        FOREIGN KEY (doctor_id) 
        REFERENCES auth.users(id) 
        ON DELETE SET NULL
);

-- Create function to update user metadata
CREATE OR REPLACE FUNCTION update_scan_request_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update patient metadata
    IF (TG_OP = 'INSERT') OR (NEW.patient_id IS DISTINCT FROM OLD.patient_id) THEN
        SELECT email, raw_user_meta_data->>'full_name'
        INTO NEW.patient_email, NEW.patient_name
        FROM auth.users
        WHERE id = NEW.patient_id;
    END IF;

    -- Update doctor metadata
    IF (TG_OP = 'INSERT' AND NEW.doctor_id IS NOT NULL) 
    OR (TG_OP = 'UPDATE' AND NEW.doctor_id IS DISTINCT FROM OLD.doctor_id) THEN
        SELECT email, raw_user_meta_data->>'full_name'
        INTO NEW.doctor_email, NEW.doctor_name
        FROM auth.users
        WHERE id = NEW.doctor_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user metadata
CREATE TRIGGER update_scan_request_user_metadata
    BEFORE INSERT OR UPDATE ON scan_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_scan_request_user_metadata();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scan_requests_updated_at
    BEFORE UPDATE ON scan_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE scan_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Patients can view own requests"
    ON scan_requests FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create requests"
    ON scan_requests FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own pending requests"
    ON scan_requests FOR UPDATE
    USING (auth.uid() = patient_id AND status = 'pending');

CREATE POLICY "Doctors can view assigned requests"
    ON scan_requests FOR SELECT
    USING (
        doctor_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'doctor'
        )
    );

CREATE POLICY "Doctors can update assigned requests"
    ON scan_requests FOR UPDATE
    USING (
        doctor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'doctor'
        )
    );

CREATE POLICY "Admins have full access"
    ON scan_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create indexes for better query performance
CREATE INDEX idx_scan_requests_patient_id ON scan_requests(patient_id);
CREATE INDEX idx_scan_requests_doctor_id ON scan_requests(doctor_id);
CREATE INDEX idx_scan_requests_status ON scan_requests(status);
CREATE INDEX idx_scan_requests_created_at ON scan_requests(created_at DESC);
