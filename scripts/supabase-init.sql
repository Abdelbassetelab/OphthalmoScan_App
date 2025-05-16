-- OphthalmoScan-AI Database Schema Migration
-- This script sets up the initial database schema for the OphthalmoScan-AI application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles enum for user types (with conditional check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');
    END IF;
END$$;

-- Create scan_type enum for different types of eye scans (with conditional check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scan_type') THEN
        CREATE TYPE scan_type AS ENUM ('fundus', 'oct', 'visual_field', 'corneal_topography', 'other');
    END IF;
END$$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  medical_history JSONB,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id)
);

-- Create scans table if it doesn't exist
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  scan_type scan_type NOT NULL,
  scan_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  doctor_id UUID REFERENCES users(id) NOT NULL,
  metadata JSONB
);

-- Create diagnoses table if it doesn't exist
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  diagnosis_date TIMESTAMP WITH TIME ZONE NOT NULL,
  doctor_id UUID REFERENCES users(id),
  ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT
);

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT
);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to all tables (with conditional checks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at') THEN
        CREATE TRIGGER update_patients_updated_at
        BEFORE UPDATE ON patients
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_scans_updated_at') THEN
        CREATE TRIGGER update_scans_updated_at
        BEFORE UPDATE ON scans
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_diagnoses_updated_at') THEN
        CREATE TRIGGER update_diagnoses_updated_at
        BEFORE UPDATE ON diagnoses
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Create audit logging triggers
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  old_values JSONB := NULL;
  new_values JSONB := NULL;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, new_values, NULL, NULL);
  ELSIF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, old_values, new_values, NULL, NULL);
  ELSIF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, ip_address, user_agent)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, old_values, NULL, NULL);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging triggers to all tables (with conditional checks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_users') THEN
        CREATE TRIGGER audit_users
        AFTER INSERT OR UPDATE OR DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_patients') THEN
        CREATE TRIGGER audit_patients
        AFTER INSERT OR UPDATE OR DELETE ON patients
        FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_scans') THEN
        CREATE TRIGGER audit_scans
        AFTER INSERT OR UPDATE OR DELETE ON scans
        FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_diagnoses') THEN
        CREATE TRIGGER audit_diagnoses
        AFTER INSERT OR UPDATE OR DELETE ON diagnoses
        FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    END IF;
END$$;

-- Set up Row Level Security (RLS) policies with conditional checks

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" 
        ON users FOR SELECT 
        USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" 
        ON users FOR UPDATE 
        USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Doctors can view patient profiles') THEN
        CREATE POLICY "Doctors can view patient profiles" 
        ON users FOR SELECT 
        USING (
            -- Doctor viewing a patient
            (
            auth.uid() IN (SELECT id FROM users WHERE role = 'doctor') 
            AND role = 'patient'
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can view all profiles') THEN
        CREATE POLICY "Admins can view all profiles" 
        ON users FOR SELECT 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can update all profiles') THEN
        CREATE POLICY "Admins can update all profiles" 
        ON users FOR UPDATE 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
    END IF;
END$$;

-- Patients table policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Patients can view their own record') THEN
        CREATE POLICY "Patients can view their own record" 
        ON patients FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Doctors can view all patients') THEN
        CREATE POLICY "Doctors can view all patients" 
        ON patients FOR SELECT 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Doctors can insert patients') THEN
        CREATE POLICY "Doctors can insert patients" 
        ON patients FOR INSERT 
        WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Doctors can update patients') THEN
        CREATE POLICY "Doctors can update patients" 
        ON patients FOR UPDATE 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Admins can do anything with patients') THEN
        CREATE POLICY "Admins can do anything with patients" 
        ON patients FOR ALL 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
    END IF;
END$$;

-- Scans table policies
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scans' AND policyname = 'Patients can view their own scans') THEN
        CREATE POLICY "Patients can view their own scans" 
        ON scans FOR SELECT 
        USING (
            patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scans' AND policyname = 'Doctors can view all scans') THEN
        CREATE POLICY "Doctors can view all scans" 
        ON scans FOR SELECT 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scans' AND policyname = 'Doctors can insert scans') THEN
        CREATE POLICY "Doctors can insert scans" 
        ON scans FOR INSERT 
        WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scans' AND policyname = 'Doctors can update scans') THEN
        CREATE POLICY "Doctors can update scans" 
        ON scans FOR UPDATE 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scans' AND policyname = 'Admins can do anything with scans') THEN
        CREATE POLICY "Admins can do anything with scans" 
        ON scans FOR ALL 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
    END IF;
END$$;

-- Diagnoses table policies
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnoses' AND policyname = 'Patients can view their own diagnoses') THEN
        CREATE POLICY "Patients can view their own diagnoses" 
        ON diagnoses FOR SELECT 
        USING (
            scan_id IN (
            SELECT id FROM scans WHERE patient_id IN (
                SELECT id FROM patients WHERE user_id = auth.uid()
            )
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnoses' AND policyname = 'Doctors can view all diagnoses') THEN
        CREATE POLICY "Doctors can view all diagnoses" 
        ON diagnoses FOR SELECT 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnoses' AND policyname = 'Doctors can insert diagnoses') THEN
        CREATE POLICY "Doctors can insert diagnoses" 
        ON diagnoses FOR INSERT 
        WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnoses' AND policyname = 'Doctors can update diagnoses') THEN
        CREATE POLICY "Doctors can update diagnoses" 
        ON diagnoses FOR UPDATE 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'doctor'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'diagnoses' AND policyname = 'Admins can do anything with diagnoses') THEN
        CREATE POLICY "Admins can do anything with diagnoses" 
        ON diagnoses FOR ALL 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
    END IF;
END$$;

-- Audit logs table policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Only admins can view audit logs') THEN
        CREATE POLICY "Only admins can view audit logs" 
        ON audit_logs FOR SELECT 
        USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
    END IF;
END$$;

-- Function to handle new user registration (with conditional check)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a user profile when a new auth user is created (with conditional check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END$$;

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- User record deletion is handled by ON DELETE CASCADE
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle cleanup when an auth user is deleted (with conditional check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_deleted') THEN
        CREATE TRIGGER on_auth_user_deleted
        AFTER DELETE ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();
    END IF;
END$$;