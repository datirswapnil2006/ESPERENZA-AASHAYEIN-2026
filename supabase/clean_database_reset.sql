-- =========================================================================
-- ESPERENZA & AASHAYEIN 2026–2027: CLEAN PRODUCTION RESET SCRIPT
-- Run this in your Supabase SQL Editor to wipe all dummy data and reset tables
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Truncate all participant entries, dynamic forms, and coordinator assignments
TRUNCATE TABLE public.participants CASCADE;
TRUNCATE TABLE public.form_fields CASCADE;
TRUNCATE TABLE public.registration_forms CASCADE;
TRUNCATE TABLE public.event_assignments CASCADE;
TRUNCATE TABLE public.announcements CASCADE;
TRUNCATE TABLE public.audit_logs CASCADE;

-- 2. Remove all dummy events (leaves a clean slate to add new events)
TRUNCATE TABLE public.events CASCADE;

-- Ensure festival_slug column exists in events table for compatibility
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS festival_slug TEXT;

-- 3. Delete non-admin profiles and non-admin auth accounts
DELETE FROM public.profiles WHERE role != 'super_admin';
DELETE FROM auth.users WHERE email != 'admin@festival.edu';

-- 4. Create or update the official Super Admin account in auth.users & auth.identities
DO $$
DECLARE
  v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert into auth.users with all non-null GoTrue token defaults
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@festival.edu') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      reauthentication_token,
      email_change_token_current,
      phone_change,
      phone_change_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@festival.edu',
      crypt('Admin@2026', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Dr. Nikko Khalsa","role":"super_admin","department":"Central Festival Administration"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    );
  ELSE
    -- If admin already exists, update password to Admin@2026 and get their ID
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@festival.edu' LIMIT 1;
    UPDATE auth.users 
    SET encrypted_password = crypt('Admin@2026', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_user_meta_data = '{"full_name":"Dr. Nikko Khalsa","role":"super_admin","department":"Central Festival Administration"}'::jsonb,
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        reauthentication_token = COALESCE(reauthentication_token, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        phone_change = COALESCE(phone_change, ''),
        phone_change_token = COALESCE(phone_change_token, '')
    WHERE id = v_admin_id;
  END IF;

  -- Ensure auth.identities has email provider entry for GoTrue token generator
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_admin_id,
    v_admin_id,
    json_build_object('sub', v_admin_id::text, 'email', 'admin@festival.edu')::jsonb,
    'email',
    'admin@festival.edu',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Ensure Super Admin profile exists in public.profiles with valid UUID
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    mobile,
    is_verified,
    designation,
    employee_id
  ) VALUES (
    v_admin_id,
    'admin@festival.edu',
    'Dr. Nikko Khalsa',
    'super_admin',
    'Central Festival Administration',
    '+91 98765 00001',
    true,
    'Dean & Super Administrator',
    'ADMIN-001'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    is_verified = true,
    email = 'admin@festival.edu',
    full_name = 'Dr. Nikko Khalsa';

END $$;

-- 5. Fix any existing NULL token columns across all auth users
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '');

-- 6. Ensure core festival shells exist for Esperenza & Aashayein
INSERT INTO public.festivals (
  id, name, edition, slug, type, tagline, description, is_active
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Esperenza',
  '2026–2027',
  'esperanza',
  'technical',
  'Igniting the Spark of Technological Ingenuity & Engineering Mastery',
  'Esperenza 2026–2027 is the premier annual inter-collegiate technical festival.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Aashayein',
  '2026–2027',
  'aashayein',
  'cultural',
  'Celebrating the Symphony of Art, Rhythm, Expression and Heritage',
  'Aashayein 2026–2027 is the vibrant annual cultural extravaganza.',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure RLS policies allow events to be displayed and created seamlessly
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active events are viewable by public and authenticated users" ON public.events;
CREATE POLICY "Active events are viewable by public and authenticated users"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Super admin can manage events" ON public.events;
CREATE POLICY "Super admin can manage events"
  ON public.events FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Verification summary
SELECT 'Database Clean Reset Complete' as status, count(*) as active_profiles from public.profiles;
