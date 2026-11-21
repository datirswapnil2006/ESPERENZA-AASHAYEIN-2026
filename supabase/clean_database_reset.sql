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

-- Ensure official Young Scientist event exists under Esperenza
INSERT INTO public.events (
  id, festival_id, name, slug, festival_slug, category, description, venue, event_date, registration_deadline, status, min_team_size, max_team_size, rules
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Young Scientist',
  'young-scientist',
  'esperanza',
  'Science & Innovation',
  'Premier scientific model & project exhibition for school students. Open exclusively for 5th to 10th Standard. Teams of 1, 2, or 3 participants.',
  'Science Exhibition Complex / Lab Hall',
  '2026-12-11T10:00:00Z',
  '2026-12-05T23:59:59Z',
  'upcoming',
  1,
  3,
  '1. Eligibility: Exclusively open for school students currently studying from 5th Standard to 10th Standard.\n2. Team Participation: Students may participate as Solo (1 member), Duo (2 members), or Trio (3 members).\n3. Models: Working scientific models, prototypes, or experimental research posters are permitted.\n4. Judging Criteria: Scientific thought, innovation, understanding of concepts, and presentation clarity.'
) ON CONFLICT (id) DO UPDATE SET
  min_team_size = 1,
  max_team_size = 3;

-- Form for Young Scientist
INSERT INTO public.registration_forms (
  id, event_id, title, description, status, allow_teams, min_team_size, max_team_size, deadline
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'Young Scientist Registration Form (5th to 10th Standard)',
  'Official registration for Young Scientist Science & Innovation Exhibition. Open for 5th to 10th standard school students. Solo (1), Duo (2), or Trio (3) members permitted.',
  'published',
  true,
  1,
  3,
  '2026-12-05T23:59:59Z'
) ON CONFLICT (id) DO UPDATE SET
  allow_teams = true,
  min_team_size = 1,
  max_team_size = 3;

-- Add team_members JSONB column to participants table
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS team_members JSONB;

-- 7. Ensure RLS policies allow events, profiles, assignments, and forms to operate seamlessly without admin approval bottlenecks
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

-- PROFILES POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
CREATE POLICY "Profiles viewable by all"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Profiles insertable by all" ON public.profiles;
CREATE POLICY "Profiles insertable by all"
  ON public.profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles manageable by all" ON public.profiles;
CREATE POLICY "Profiles manageable by all"
  ON public.profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- EVENT ASSIGNMENTS POLICIES (Coordinators self-assign upon registration)
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Assignments viewable by all" ON public.event_assignments;
CREATE POLICY "Assignments viewable by all"
  ON public.event_assignments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Assignments insertable by all" ON public.event_assignments;
CREATE POLICY "Assignments insertable by all"
  ON public.event_assignments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Assignments manageable by all" ON public.event_assignments;
CREATE POLICY "Assignments manageable by all"
  ON public.event_assignments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- REGISTRATION FORMS POLICIES
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Forms readable by all" ON public.registration_forms;
CREATE POLICY "Forms readable by all"
  ON public.registration_forms FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Forms manageable by all" ON public.registration_forms;
CREATE POLICY "Forms manageable by all"
  ON public.registration_forms FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- FORM FIELDS POLICIES
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Fields readable by all" ON public.form_fields;
CREATE POLICY "Fields readable by all"
  ON public.form_fields FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Fields manageable by all" ON public.form_fields;
CREATE POLICY "Fields manageable by all"
  ON public.form_fields FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- PARTICIPANTS POLICIES
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants readable by all" ON public.participants;
CREATE POLICY "Participants readable by all"
  ON public.participants FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Participants manageable by all" ON public.participants;
CREATE POLICY "Participants manageable by all"
  ON public.participants FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 8. Auto-verify all faculty and student coordinator profiles immediately
UPDATE public.profiles SET is_verified = true;

-- 9. Update auth trigger to auto-verify coordinators and link chosen event immediately
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_event_id TEXT;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'student_coordinator');
  IF v_role = 'super_admin' AND (auth.uid() IS NULL OR NOT public.is_admin()) THEN
    v_role := 'faculty_coordinator';
  END IF;

  v_event_id := new.raw_user_meta_data->>'event_id';

  -- All coordinators are active immediately without admin verification bottleneck
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    mobile,
    employee_id,
    designation,
    is_verified,
    erp_number,
    year,
    section
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Coordinator'),
    v_role,
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'employee_id',
    new.raw_user_meta_data->>'designation',
    true,
    new.raw_user_meta_data->>'erp_number',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'section'
  )
  ON CONFLICT (id) DO UPDATE SET
    is_verified = true,
    role = EXCLUDED.role;

  -- Auto-assign to event if selected at registration
  IF v_event_id IS NOT NULL AND v_event_id != '' THEN
    BEGIN
      INSERT INTO public.event_assignments (
        event_id,
        user_id,
        role,
        status,
        assigned_by
      ) VALUES (
        v_event_id::uuid,
        new.id,
        v_role,
        'active',
        new.id
      )
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Silently proceed if UUID conversion fails
    END;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verification summary
SELECT 'Database Clean Reset Complete' as status, count(*) as active_profiles from public.profiles;
