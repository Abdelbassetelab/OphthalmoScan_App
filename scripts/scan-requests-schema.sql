-- Create scan_requests table
CREATE TABLE IF NOT EXISTS scan_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  symptoms TEXT,
  medical_history TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_doctor_id UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  scan_id UUID REFERENCES scans(id)
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS (Row Level Security) policies
ALTER TABLE scan_requests ENABLE ROW LEVEL SECURITY;

-- Policies for scan_requests
CREATE POLICY "Users can view their own scan requests"
  ON scan_requests FOR SELECT
  USING (
    auth.uid() = patient_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor')
    )
  );

CREATE POLICY "Patients can create their own scan requests"
  ON scan_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins and doctors can update any scan request"
  ON scan_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'doctor')
    )
  );

-- Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);