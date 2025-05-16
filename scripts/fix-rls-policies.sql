-- Complete Supabase Auth Setup with RLS Policies and Triggers
-- This script sets up everything needed for a robust authentication system

------------------------------------------
-- PART 1: TABLE SETUP & CLEANUP
------------------------------------------

-- Ensure the public users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger to users table
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

------------------------------------------
-- PART 2: ROW LEVEL SECURITY SETUP
------------------------------------------

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.users;
DROP POLICY IF EXISTS "Users can read their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
DROP POLICY IF EXISTS "Allow users to delete their own records" ON public.users;
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Doctors can view patient records" ON public.users;

-- Allow anonymous users to register
DROP POLICY IF EXISTS "Public can insert users" ON public.users;
CREATE POLICY "Public can insert users"
  ON public.users
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users: select own or admin
DROP POLICY IF EXISTS "Users can select their own record" ON public.users;
CREATE POLICY "Users can select their own record"
  ON public.users
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Allow users to update their own record
CREATE POLICY "Users can update their own record"
  ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins: full read/update/delete access
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users"
  ON public.users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Regular users may delete only their own record
DROP POLICY IF EXISTS "Users can delete their own record" ON public.users;
CREATE POLICY "Users can delete their own record"
  ON public.users
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

------------------------------------------
-- PART 3: USER CREATION TRIGGER
------------------------------------------

-- Create the function to handle new user registration
-- This is critical for the signup process
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name TEXT;
  last_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract user metadata
  first_name := NEW.raw_user_meta_data->>'first_name';
  last_name := NEW.raw_user_meta_data->>'last_name';
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
  
  -- Validate role
  IF user_role NOT IN ('patient', 'doctor', 'admin') THEN
    user_role := 'patient'; -- Default to patient for safety
  END IF;
  
  -- Insert the new user into the public.users table
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    first_name,
    last_name,
    user_role
  )
  -- If there's a conflict, do nothing (user might already exist)
  ON CONFLICT (id) DO NOTHING;
  
  -- Log the successful user creation (optional, can be removed in production)
  -- INSERT INTO public.audit_logs (event, user_id, details)
  -- VALUES ('user_created', NEW.id, json_build_object('email', NEW.email, 'role', user_role));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that automatically adds new auth users to public.users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

------------------------------------------
-- PART 4: USER DELETION TRIGGER (OPTIONAL)
------------------------------------------

-- Create function to handle when users are deleted
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Here you could add cleanup logic if needed
  -- For example, anonymizing user data instead of full deletion
  
  -- Log the deletion (optional, can be removed in production)
  -- INSERT INTO public.audit_logs (event, user_id, details)
  -- VALUES ('user_deleted', OLD.id, json_build_object('email', OLD.email));
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

------------------------------------------
-- PART 5: ADD DATABASE SCHEMA VERIFICATION
------------------------------------------

-- This function checks if the schema is set up correctly
-- Useful for debugging setup issues
CREATE OR REPLACE FUNCTION public.verify_auth_setup()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users_table_exists', EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ),
    'trigger_exists', EXISTS (
      SELECT FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ),
    'rls_enabled', EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true
    ),
    'insert_policy_exists', EXISTS (
      SELECT FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Allow public insert for registration'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Auth setup completed successfully. Run SELECT verify_auth_setup(); to confirm setup.';
END $$;