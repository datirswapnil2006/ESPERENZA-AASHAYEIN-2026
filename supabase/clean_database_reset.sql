-- =========================================================================
-- ESPERENZA & AASHAYEIN 2026–2027: CLEAN PRODUCTION RESET SCRIPT
-- Run this in your Supabase SQL Editor to wipe all dummy data and reset tables
-- =========================================================================

-- 1. Truncate all participant entries, dynamic forms, and coordinator assignments
TRUNCATE TABLE public.participants CASCADE;
TRUNCATE TABLE public.form_fields CASCADE;
TRUNCATE TABLE public.registration_forms CASCADE;
TRUNCATE TABLE public.event_assignments CASCADE;
TRUNCATE TABLE public.announcements CASCADE;
TRUNCATE TABLE public.audit_logs CASCADE;

-- 2. Remove all dummy events (leaving a clean slate for creating new events)
TRUNCATE TABLE public.events CASCADE;

-- 3. Remove all dummy accounts except the primary Super Admin
DELETE FROM public.profiles WHERE role != 'super_admin';

-- 4. Ensure Super Admin profile exists with full administrative privileges
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
)
VALUES (
  'admin-primary-001',
  'admin@festival.edu',
  'Dr. Rajesh Sharma',
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
  email = 'admin@festival.edu';

-- 5. Ensure core festival shells exist for Esperenza & Aashayein
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

-- Verification query
SELECT 'Reset Complete. Active Profiles:' as status, count(*) from public.profiles;
