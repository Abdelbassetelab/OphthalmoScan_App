-- OphthalmoScan-AI Database Initialization
-- This script sets up the necessary tables and relationships for the OphthalmoScan-AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up custom schemas (in addition to auth schema that comes with Supabase)
CREATE SCHEMA IF NOT EXISTS ophthalmoscan;

-- ====== ROLE-BASED ACCESS CONTROL ======

-- Create roles table to manage user roles
CREATE TABLE ophthalmoscan.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO ophthalmoscan.roles (name, description) VALUES
    ('admin', 'System administrator with full access'),
    ('doctor', 'Medical professional with access to patient records and diagnoses'),
    ('patient', 'Patient with access to own records and scans');

-- Create permissions table
CREATE TABLE ophthalmoscan.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default permissions
INSERT INTO ophthalmoscan.permissions (name, description) VALUES
    ('create:patient', 'Create patient records'),
    ('read:patient', 'View patient records'),
    ('update:patient', 'Update patient records'),
    ('delete:patient', 'Delete patient records'),
    ('create:scan', 'Upload scans'),
    ('read:scan', 'View scans'),
    ('update:scan', 'Update scan metadata'),
    ('delete:scan', 'Delete scans'),
    ('create:diagnosis', 'Create diagnoses'),
    ('read:diagnosis', 'View diagnoses'),
    ('update:diagnosis', 'Update diagnoses'),
    ('delete:diagnosis', 'Delete diagnoses'),
    ('manage:users', 'Manage user accounts'),
    ('view:stats', 'View system statistics');

-- Create role_permissions junction table
CREATE TABLE ophthalmoscan.role_permissions (
    role_id UUID REFERENCES ophthalmoscan.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES ophthalmoscan.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Assign permissions to roles
DO $$
DECLARE
    admin_role_id UUID;
    doctor_role_id UUID;
    patient_role_id UUID;
    perm_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM ophthalmoscan.roles WHERE name = 'admin';
    SELECT id INTO doctor_role_id FROM ophthalmoscan.roles WHERE name = 'doctor';
    SELECT id INTO patient_role_id FROM ophthalmoscan.roles WHERE name = 'patient';
    
    -- Assign all permissions to admin
    FOR perm_id IN SELECT id FROM ophthalmoscan.permissions LOOP
        INSERT INTO ophthalmoscan.role_permissions (role_id, permission_id) 
        VALUES (admin_role_id, perm_id);
    END LOOP;
    
    -- Assign doctor permissions
    FOR perm_id IN SELECT id FROM ophthalmoscan.permissions 
        WHERE name IN (
            'create:patient', 'read:patient', 'update:patient',
            'create:scan', 'read:scan', 'update:scan',
            'create:diagnosis', 'read:diagnosis', 'update:diagnosis',
            'view:stats'
        ) 
    LOOP
        INSERT INTO ophthalmoscan.role_permissions (role_id, permission_id) 
        VALUES (doctor_role_id, perm_id);
    END LOOP;
    
    -- Assign patient permissions
    FOR perm_id IN SELECT id FROM ophthalmoscan.permissions 
        WHERE name IN (
            'read:patient', 'update:patient',
            'create:scan', 'read:scan',
            'read:diagnosis'
        ) 
    LOOP
        INSERT INTO ophthalmoscan.role_permissions (role_id, permission_id) 
        VALUES (patient_role_id, perm_id);
    END LOOP;
END $$;

-- ====== USER PROFILE EXTENSION ======

-- Create profiles table to extend auth.users
CREATE TABLE ophthalmoscan.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    role_id UUID REFERENCES ophthalmoscan.roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====== PATIENT RECORDS ======

-- Create patients table
CREATE TABLE ophthalmoscan.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    medical_record_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    blood_type TEXT,
    allergies TEXT[],
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create an index on medical_record_number for quick lookups
CREATE INDEX idx_patients_mrn ON ophthalmoscan.patients(medical_record_number);

-- ====== MEDICAL SCANS ======

-- Create enum for scan types
CREATE TYPE ophthalmoscan.scan_type AS ENUM (
    'fundus', 
    'oct', 
    'visual_field', 
    'corneal_topography', 
    'retinal_angiography', 
    'ultrasound',
    'other'
);

-- Create enum for scan status
CREATE TYPE ophthalmoscan.scan_status AS ENUM (
    'pending', 
    'processing', 
    'analyzed', 
    'reviewed', 
    'archived'
);

-- Create scans table
CREATE TABLE ophthalmoscan.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES ophthalmoscan.patients(id) ON DELETE CASCADE,
    scan_type ophthalmoscan.scan_type NOT NULL,
    eye_side TEXT CHECK (eye_side IN ('left', 'right', 'both')),
    scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status ophthalmoscan.scan_status NOT NULL DEFAULT 'pending',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    metadata JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX idx_scans_patient ON ophthalmoscan.scans(patient_id);
CREATE INDEX idx_scans_type ON ophthalmoscan.scans(scan_type);
CREATE INDEX idx_scans_status ON ophthalmoscan.scans(status);
CREATE INDEX idx_scans_date ON ophthalmoscan.scans(scan_date);

-- ====== AI ANALYSIS ======

-- Create enum for confidence levels
CREATE TYPE ophthalmoscan.confidence_level AS ENUM (
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
);

-- Create AI analysis results table
CREATE TABLE ophthalmoscan.ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES ophthalmoscan.scans(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    findings JSONB,
    confidence ophthalmoscan.confidence_level,
    model_version TEXT,
    processing_time FLOAT,
    annotations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for quick lookup by scan
CREATE INDEX idx_ai_analyses_scan ON ophthalmoscan.ai_analyses(scan_id);

-- ====== MEDICAL DIAGNOSES ======

-- Create enum for diagnosis severity
CREATE TYPE ophthalmoscan.severity_level AS ENUM (
    'minimal',
    'mild',
    'moderate',
    'severe',
    'critical'
);

-- Create diagnoses table
CREATE TABLE ophthalmoscan.diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES ophthalmoscan.patients(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES ophthalmoscan.scans(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    diagnosis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    condition_name TEXT NOT NULL,
    icd_code TEXT,
    description TEXT,
    severity ophthalmoscan.severity_level,
    treatment_plan TEXT,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for diagnoses
CREATE INDEX idx_diagnoses_patient ON ophthalmoscan.diagnoses(patient_id);
CREATE INDEX idx_diagnoses_scan ON ophthalmoscan.diagnoses(scan_id);
CREATE INDEX idx_diagnoses_doctor ON ophthalmoscan.diagnoses(doctor_id);
CREATE INDEX idx_diagnoses_date ON ophthalmoscan.diagnoses(diagnosis_date);
CREATE INDEX idx_diagnoses_condition ON ophthalmoscan.diagnoses(condition_name);

-- ====== APPOINTMENTS ======

-- Create enum for appointment status
CREATE TYPE ophthalmoscan.appointment_status AS ENUM (
    'scheduled',
    'confirmed',
    'cancelled',
    'completed',
    'no_show'
);

-- Create appointments table
CREATE TABLE ophthalmoscan.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES ophthalmoscan.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30, -- duration in minutes
    status ophthalmoscan.appointment_status NOT NULL DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for appointments
CREATE INDEX idx_appointments_patient ON ophthalmoscan.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON ophthalmoscan.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON ophthalmoscan.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON ophthalmoscan.appointments(status);

-- ====== NOTIFICATIONS ======

-- Create enum for notification types
CREATE TYPE ophthalmoscan.notification_type AS ENUM (
    'appointment_reminder',
    'new_scan',
    'diagnosis_available',
    'system_message',
    'treatment_reminder'
);

-- Create notifications table
CREATE TABLE ophthalmoscan.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type ophthalmoscan.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user ON ophthalmoscan.notifications(user_id);
CREATE INDEX idx_notifications_read ON ophthalmoscan.notifications(read);
CREATE INDEX idx_notifications_created ON ophthalmoscan.notifications(created_at);

-- ====== USER ACTIVITY TRACKING ======

-- Create a comprehensive audit log table
CREATE TABLE ophthalmoscan.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'patient', 'scan', 'diagnosis', etc.
    entity_id UUID, -- ID of the relevant entity
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'login', etc.
    details JSONB, -- Any additional details about the action
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity logs
CREATE INDEX idx_activity_logs_user ON ophthalmoscan.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON ophthalmoscan.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_action ON ophthalmoscan.activity_logs(action);
CREATE INDEX idx_activity_logs_created ON ophthalmoscan.activity_logs(created_at);

-- ====== SETTINGS ======

-- Create system settings table
CREATE TABLE ophthalmoscan.settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Insert some default settings
INSERT INTO ophthalmoscan.settings (id, value, description) VALUES
    ('notification_settings', '{"email_enabled": true, "sms_enabled": false}', 'System-wide notification settings'),
    ('ai_analysis_settings', '{"default_model": "ophtha-v2", "confidence_threshold": 0.75}', 'AI analysis configuration'),
    ('appointment_settings', '{"default_duration": 30, "reminder_hours": 24}', 'Default appointment settings');

-- Create user settings table for per-user preferences
CREATE TABLE ophthalmoscan.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}',
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====== ENABLE ROW LEVEL SECURITY ======

-- Enable row level security for all tables
ALTER TABLE ophthalmoscan.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ophthalmoscan.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for each table based on roles
-- This is a simplified example; in a real application you'd need more granular policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON ophthalmoscan.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON ophthalmoscan.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON ophthalmoscan.profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM ophthalmoscan.profiles p
  JOIN ophthalmoscan.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid() AND r.name = 'admin'
));

-- ====== REALTIME PUBLICATIONS ======

-- Enable publications for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ophthalmoscan.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ophthalmoscan.appointments;

-- ====== CREATE VIEWS ======

-- View for patients with their last scan and diagnosis
CREATE VIEW ophthalmoscan.patient_summary AS
SELECT 
  p.id,
  p.medical_record_number,
  p.first_name,
  p.last_name,
  p.date_of_birth,
  p.gender,
  (
    SELECT jsonb_build_object(
      'id', s.id,
      'scan_type', s.scan_type,
      'scan_date', s.scan_date,
      'status', s.status
    )
    FROM ophthalmoscan.scans s
    WHERE s.patient_id = p.id
    ORDER BY s.scan_date DESC
    LIMIT 1
  ) as last_scan,
  (
    SELECT jsonb_build_object(
      'id', d.id,
      'condition_name', d.condition_name,
      'diagnosis_date', d.diagnosis_date,
      'severity', d.severity,
      'doctor_id', d.doctor_id
    )
    FROM ophthalmoscan.diagnoses d
    WHERE d.patient_id = p.id
    ORDER BY d.diagnosis_date DESC
    LIMIT 1
  ) as last_diagnosis,
  (
    SELECT a.appointment_date
    FROM ophthalmoscan.appointments a
    WHERE a.patient_id = p.id AND a.appointment_date > NOW() AND a.status = 'scheduled'
    ORDER BY a.appointment_date ASC
    LIMIT 1
  ) as next_appointment
FROM ophthalmoscan.patients p;

-- View for recent scans with their analysis status
CREATE VIEW ophthalmoscan.recent_scans_summary AS
SELECT 
  s.id,
  s.patient_id,
  p.first_name || ' ' || p.last_name AS patient_name,
  s.scan_type,
  s.eye_side,
  s.scan_date,
  s.status,
  (
    SELECT ai.confidence
    FROM ophthalmoscan.ai_analyses ai
    WHERE ai.scan_id = s.id
    LIMIT 1
  ) as ai_confidence,
  (
    SELECT COUNT(*)
    FROM ophthalmoscan.diagnoses d
    WHERE d.scan_id = s.id
  ) as diagnosis_count
FROM ophthalmoscan.scans s
JOIN ophthalmoscan.patients p ON s.patient_id = p.id
ORDER BY s.scan_date DESC;

-- View for doctors with their patient count and next appointments
CREATE VIEW ophthalmoscan.doctor_summary AS
SELECT 
  u.id,
  p.first_name,
  p.last_name,
  (
    SELECT COUNT(*)
    FROM ophthalmoscan.diagnoses d
    WHERE d.doctor_id = u.id
  ) as diagnosis_count,
  (
    SELECT COUNT(DISTINCT patient_id)
    FROM ophthalmoscan.diagnoses d
    WHERE d.doctor_id = u.id
  ) as patient_count,
  (
    SELECT jsonb_agg(appointment_data)
    FROM (
      SELECT jsonb_build_object(
        'id', a.id,
        'patient_id', a.patient_id,
        'patient_name', concat(pt.first_name, ' ', pt.last_name),
        'appointment_date', a.appointment_date,
        'status', a.status
      ) AS appointment_data
      FROM ophthalmoscan.appointments a
      JOIN ophthalmoscan.patients pt ON a.patient_id = pt.id
      WHERE a.doctor_id = u.id AND a.appointment_date > NOW() AND a.status = 'scheduled'
      ORDER BY a.appointment_date ASC
      LIMIT 5
    ) sub
  ) as upcoming_appointments
FROM auth.users u
JOIN ophthalmoscan.profiles p ON u.id = p.id
JOIN ophthalmoscan.roles r ON p.role_id = r.id
WHERE r.name = 'doctor';

-- End of initialization script