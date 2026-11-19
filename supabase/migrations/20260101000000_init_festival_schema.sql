-- ==============================================================================
-- ESPERENZA & AASHAYEIN 2026-2027: College Festival Management Platform
-- Full Database Migration & Row Level Security Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'faculty_coordinator', 'student_coordinator')),
    department TEXT,
    mobile TEXT,
    avatar_url TEXT,
    -- Faculty specific fields
    employee_id TEXT,
    designation TEXT,
    is_verified BOOLEAN DEFAULT false,
    -- Student specific fields
    erp_number TEXT,
    year TEXT,
    section TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FESTIVALS TABLE
CREATE TABLE IF NOT EXISTS public.festivals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    edition TEXT NOT NULL DEFAULT '2026–2027',
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('technical', 'cultural')),
    tagline TEXT,
    description TEXT,
    banner_url TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    description TEXT,
    image_url TEXT,
    venue TEXT NOT NULL DEFAULT 'Main Campus Auditorium',
    event_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    registration_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '25 days'),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    min_team_size INT DEFAULT 1,
    max_team_size INT DEFAULT 1,
    rules TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_festival_event_slug UNIQUE (festival_id, slug)
);

-- 4. COORDINATOR APPLICATIONS (Initial self-signup coordinator requests)
CREATE TABLE IF NOT EXISTS public.coordinator_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    festival_id UUID NOT NULL REFERENCES public.festivals(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('faculty_coordinator', 'student_coordinator')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.event_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('faculty_coordinator', 'student_coordinator', 'co_coordinator', 'volunteer')),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'replaced')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REGISTRATION FORMS TABLE
CREATE TABLE IF NOT EXISTS public.registration_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    deadline TIMESTAMPTZ,
    allow_teams BOOLEAN DEFAULT false,
    min_team_size INT DEFAULT 1,
    max_team_size INT DEFAULT 4,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FORM FIELDS TABLE
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES public.registration_forms(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'email', 'dropdown', 'radio', 'checkbox', 'date', 'textarea')),
    placeholder TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false,
    field_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.registration_forms(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    erp_number TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    is_team BOOLEAN DEFAULT false,
    team_name TEXT,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_participant UNIQUE (event_id, erp_number)
);

-- 9. PARTICIPANT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.participant_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
    answer_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'coordinators', 'faculty', 'students', 'participants')),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_events_festival_id ON public.events(festival_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_event_assignments_event ON public.event_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_assignments_user ON public.event_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_assignments_status ON public.event_assignments(status);
CREATE INDEX IF NOT EXISTS idx_forms_event ON public.registration_forms(event_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_form ON public.form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_participants_event ON public.participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_erp ON public.participants(erp_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Helper: Check if current authenticated user is super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- Helper: Check if current authenticated user is verified faculty
CREATE OR REPLACE FUNCTION public.is_verified_faculty()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'faculty_coordinator'
      AND is_verified = true
  );
$$;

-- Helper: Check if current authenticated user has active access to an event
CREATE OR REPLACE FUNCTION public.has_event_access(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.event_assignments
      WHERE event_id = p_event_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );
$$;

-- Helper: Check if current authenticated user is assigned faculty for an event
CREATE OR REPLACE FUNCTION public.is_assigned_faculty(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.event_assignments
      WHERE event_id = p_event_id
        AND user_id = auth.uid()
        AND role = 'faculty_coordinator'
        AND status = 'active'
    )
  );
$$;

-- ==============================================================================
-- DATABASE TRIGGER: AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_is_verified BOOLEAN;
BEGIN
  -- Safe role extraction: defaults to 'student_coordinator'
  -- Never allow public signup to assign 'super_admin' via raw user metadata
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'student_coordinator');
  IF v_role = 'super_admin' THEN
    -- If created directly by service key or existing admin, allow; otherwise fallback to student
    IF (auth.uid() IS NULL) OR NOT public.is_admin() THEN
      v_role := 'student_coordinator';
    END IF;
  END IF;

  -- Faculty requires verification; students are active immediately
  IF v_role = 'faculty_coordinator' THEN
    v_is_verified := false;
  ELSE
    v_is_verified := true;
  END IF;

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
    COALESCE(new.raw_user_meta_data->>'full_name', 'Festival Member'),
    v_role,
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'employee_id',
    new.raw_user_meta_data->>'designation',
    v_is_verified,
    new.raw_user_meta_data->>'erp_number',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'section'
  );

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_festivals_updated BEFORE UPDATE ON public.festivals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_assignments_updated BEFORE UPDATE ON public.event_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_forms_updated BEFORE UPDATE ON public.registration_forms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_participants_updated BEFORE UPDATE ON public.participants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self role elevation

CREATE POLICY "Super admin has full control of profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 2. FESTIVALS POLICIES
CREATE POLICY "Festivals are viewable by everyone"
  ON public.festivals FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only super admin can manage festivals"
  ON public.festivals FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 3. EVENTS POLICIES
CREATE POLICY "Active events are viewable by public and authenticated users"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (status != 'archived' OR public.is_admin());

CREATE POLICY "Super admin can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Assigned faculty can update their own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (public.is_assigned_faculty(id))
  WITH CHECK (public.is_assigned_faculty(id));

-- 4. COORDINATOR APPLICATIONS POLICIES
CREATE POLICY "Users can view and create their applications"
  ON public.coordinator_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can submit applications"
  ON public.coordinator_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin can manage coordinator applications"
  ON public.coordinator_applications FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 5. EVENT ASSIGNMENTS POLICIES
CREATE POLICY "Assignments are viewable by assigned users and admins"
  ON public.event_assignments FOR SELECT
  TO authenticated
  USING (
    public.is_admin() 
    OR user_id = auth.uid() 
    OR public.has_event_access(event_id)
  );

CREATE POLICY "Faculty can assign student coordinators to their assigned events"
  ON public.event_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() 
    OR (
      public.is_assigned_faculty(event_id) 
      AND role IN ('student_coordinator', 'co_coordinator', 'volunteer')
    )
  );

CREATE POLICY "Faculty and admin can update assignments for their events"
  ON public.event_assignments FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() 
    OR public.is_assigned_faculty(event_id)
  );

-- 6. REGISTRATION FORMS POLICIES
CREATE POLICY "Published registration forms are viewable by everyone"
  ON public.registration_forms FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.has_event_access(event_id));

CREATE POLICY "Assigned faculty can create and update registration forms"
  ON public.registration_forms FOR ALL
  TO authenticated
  USING (public.is_assigned_faculty(event_id))
  WITH CHECK (public.is_assigned_faculty(event_id));

-- 7. FORM FIELDS POLICIES
CREATE POLICY "Form fields are viewable for accessible forms"
  ON public.form_fields FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registration_forms f
      WHERE f.id = form_fields.form_id
        AND (f.status = 'published' OR public.has_event_access(f.event_id))
    )
  );

CREATE POLICY "Assigned faculty can manage form fields"
  ON public.form_fields FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registration_forms f
      WHERE f.id = form_fields.form_id
        AND public.is_assigned_faculty(f.event_id)
    )
  );

-- 8. PARTICIPANTS POLICIES
CREATE POLICY "Public can register as participants"
  ON public.participants FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registration_forms f
      WHERE f.event_id = participants.event_id
        AND f.status = 'published'
    )
  );

CREATE POLICY "Assigned coordinators and admin can view participants"
  ON public.participants FOR SELECT
  TO authenticated
  USING (public.has_event_access(event_id));

CREATE POLICY "Faculty and admin can manage participants"
  ON public.participants FOR UPDATE
  TO authenticated
  USING (public.is_assigned_faculty(event_id));

-- 9. PARTICIPANT ANSWERS POLICIES
CREATE POLICY "Public can submit participant answers"
  ON public.participant_answers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Assigned coordinators and admin can view participant answers"
  ON public.participant_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.participants p
      WHERE p.id = participant_answers.participant_id
        AND public.has_event_access(p.event_id)
    )
  );

-- 10. AUDIT LOGS POLICIES
CREATE POLICY "Only admin and relevant faculty can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin() OR (event_id IS NOT NULL AND public.is_assigned_faculty(event_id)));

CREATE POLICY "System can record audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 11. ANNOUNCEMENTS POLICIES
CREATE POLICY "Active announcements are viewable by everyone"
  ON public.announcements FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admin and faculty can create announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (event_id IS NOT NULL AND public.is_assigned_faculty(event_id))
  );

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
  -- Enable realtime on tables if publication exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_assignments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_forms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Safe fallback if publication not yet created
END $$;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Festivals: Esperenza (Technical) & Aashayein (Cultural)
INSERT INTO public.festivals (id, name, edition, slug, type, tagline, description, is_active)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Esperenza',
    '2026–2027',
    'esperanza',
    'technical',
    'Igniting the Spark of Technological Ingenuity & Engineering Mastery',
    'Esperenza 2026–2027 is the premier annual inter-collegiate technical festival bringing together brilliant minds, cutting-edge robotics, innovative research papers, coding hackathons, and scientific exhibitions.',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Aashayein',
    '2026–2027',
    'aashayein',
    'cultural',
    'Celebrating the Symphony of Art, Rhythm, Expression and Heritage',
    'Aashayein 2026–2027 is the vibrant annual cultural extravaganza celebrating artistic excellence, musical talent, dramatic expressions, high-energy dance performances, and creative storytelling.',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed Initial Events:
-- Esperenza: Young Scientist, Robo Race
-- Aashayein: Dance, Anchoring, Singing, Drama
INSERT INTO public.events (id, festival_id, name, slug, category, description, venue, event_date, registration_deadline, status, is_featured, min_team_size, max_team_size, rules)
VALUES
  -- Esperenza: Young Scientist
  (
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111111',
    'Young Scientist Exhibition',
    'young-scientist',
    'Innovation & Research',
    'Showcase working engineering prototypes, scientific inventions, AI hardware solutions, and renewable energy models before an elite panel of researchers and industry judges.',
    'R&D Innovation Lab & Exhibition Ground',
    NOW() + INTERVAL '25 days',
    NOW() + INTERVAL '20 days',
    'upcoming',
    true,
    1,
    4,
    '1. Each team can consist of 1-4 members.\n2. Prototypes must be functional or accompanied by simulated proofs.\n3. 10 minutes presentation followed by 5 minutes Q&A.\n4. Plagiarism leads to immediate disqualification.'
  ),
  -- Esperenza: Robo Race
  (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111111',
    'Robo Race Championship',
    'robo-race',
    'Robotics & Automation',
    'An intense obstacle arena challenge test of speed, torque, wireless navigation, and precision handling where custom wired and wireless bots battle the clock and treacherous terrains.',
    'Robotics Arena - Central Quadrangle',
    NOW() + INTERVAL '26 days',
    NOW() + INTERVAL '21 days',
    'upcoming',
    true,
    1,
    3,
    '1. Robot dimensions must not exceed 30cm x 30cm x 30cm.\n2. Maximum bot weight allowed is 4kg.\n3. Power supply must not exceed 24V.\n4. Time penalties apply for crossing arena boundary markers.'
  ),
  -- Aashayein: Dance
  (
    '44444444-4444-4444-4444-444444444401',
    '22222222-2222-2222-2222-222222222222',
    'Dance Championship (Solo & Group)',
    'dance',
    'Performing Arts',
    'Unleash high-octane choreography across classical, folk, contemporary, hip-hop, and fusion dance categories on the grand festival stage.',
    'Main Open Air Amphitheatre',
    NOW() + INTERVAL '27 days',
    NOW() + INTERVAL '22 days',
    'upcoming',
    true,
    1,
    12,
    '1. Performance time limit: Solo (3-4 mins), Group (5-8 mins).\n2. Tracks must be submitted in MP3 format 48 hours prior.\n3. Costumes and props must adhere to college decency standards.\n4. Judging criteria: Choreography, rhythm, facial expressions, synchrony.'
  ),
  -- Aashayein: Anchoring
  (
    '44444444-4444-4444-4444-444444444402',
    '22222222-2222-2222-2222-222222222222',
    'Anchoring & RJ Hunt',
    'anchoring',
    'Literary & Media',
    'Test your spontaneous wit, voice modulation, stage charisma, bilingual fluency, and audience engagement prowess to become the Official Voices of Aashayein 2026-2027.',
    'Seminar Hall 1',
    NOW() + INTERVAL '24 days',
    NOW() + INTERVAL '19 days',
    'upcoming',
    true,
    1,
    2,
    '1. Round 1: Prepared speech / event hosting intro (2 mins).\n2. Round 2: On-the-spot crisis management scenario hosting.\n3. Round 3: Rapid fire & interview simulation.'
  ),
  -- Aashayein: Singing
  (
    '44444444-4444-4444-4444-444444444403',
    '22222222-2222-2222-2222-222222222222',
    'Symphony: Singing Competition',
    'singing',
    'Music',
    'From soul-stirring classical melodies to energetic western pop and indie Bollywood hits, capture hearts with your vocal tone, pitch precision, and musical expression.',
    'College Main Auditorium',
    NOW() + INTERVAL '28 days',
    NOW() + INTERVAL '23 days',
    'upcoming',
    true,
    1,
    6,
    '1. Categories: Western Solo, Eastern Solo, Group Band.\n2. Backing tracks (karaoke) or acoustic accompaniment allowed.\n3. Max time: Solo (3.5 mins), Bands (6 mins).\n4. Judged on Sur, Taal, voice modulation, and stage presence.'
  ),
  -- Aashayein: Drama
  (
    '44444444-4444-4444-4444-444444444404',
    '22222222-2222-2222-2222-222222222222',
    'Natraj: Drama & Street Play',
    'drama',
    'Theatrics',
    'Powerful street plays (Nukkad Natak) addressing burning social issues and proscenium stage plays filled with poignant dialogues, dramatic arcs, and theatrical mastery.',
    'Campus Amphitheatre & Central Lawns',
    NOW() + INTERVAL '29 days',
    NOW() + INTERVAL '24 days',
    'upcoming',
    true,
    4,
    16,
    '1. Street Play time: 10-15 minutes; Stage Play: 20-30 minutes.\n2. Street play instruments: Dholak, Dafli, Harmonium permitted.\n3. Content must not contain offensive religious or political slander.\n4. Judged on screenplay, dialogue delivery, energy, and social message impact.'
  )
ON CONFLICT (festival_id, slug) DO NOTHING;

-- Seed default published registration forms for initial events so public registrations work immediately
INSERT INTO public.registration_forms (id, event_id, title, description, status, deadline, allow_teams, min_team_size, max_team_size)
VALUES
  (
    '55555555-5555-5555-5555-555555555501',
    '44444444-4444-4444-4444-444444444401',
    'Aashayein 2026 Dance Championship Registration',
    'Register for the flagship Dance Competition of Aashayein 2026–2027. Solo and group entries are welcome!',
    'published',
    NOW() + INTERVAL '22 days',
    true,
    1,
    12
  ),
  (
    '55555555-5555-5555-5555-555555555502',
    '33333333-3333-3333-3333-333333333301',
    'Esperenza 2026 Young Scientist Exhibition Registration',
    'Submit your innovative scientific prototype or research engineering project for Esperenza 2026–2027.',
    'published',
    NOW() + INTERVAL '20 days',
    true,
    1,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- Seed custom form fields for Dance registration
INSERT INTO public.form_fields (id, form_id, field_name, label, field_type, placeholder, options, is_required, field_order)
VALUES
  (
    '66666666-6666-6666-6666-666666666601',
    '55555555-5555-5555-5555-555555555501',
    'dance_style',
    'Dance Style / Genre',
    'dropdown',
    'Select your dance style',
    '["Classical / Semi-Classical", "Contemporary / Lyrical", "Hip-Hop / Street Dance", "Bollywood / Fusion", "Folk / Tribal"]'::jsonb,
    true,
    1
  ),
  (
    '66666666-6666-6666-6666-666666666602',
    '55555555-5555-5555-5555-555555555501',
    'participation_type',
    'Participation Format',
    'radio',
    '',
    '["Solo (1 participant)", "Duet (2 participants)", "Group (3 to 12 participants)"]'::jsonb,
    true,
    2
  ),
  (
    '66666666-6666-6666-6666-666666666603',
    '55555555-5555-5555-5555-555555555501',
    'track_duration',
    'Audio Track Duration (in Minutes)',
    'text',
    'e.g. 3 mins 45 secs',
    '[]'::jsonb,
    false,
    3
  ),
  (
    '66666666-6666-6666-6666-666666666604',
    '55555555-5555-5555-5555-555555555501',
    'props_required',
    'Props or Stage Requirements',
    'textarea',
    'Mention any props you will be using or special stage requirements',
    '[]'::jsonb,
    false,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- Seed custom form fields for Young Scientist
INSERT INTO public.form_fields (id, form_id, field_name, label, field_type, placeholder, options, is_required, field_order)
VALUES
  (
    '66666666-6666-6666-6666-666666666605',
    '55555555-5555-5555-5555-555555555502',
    'project_title',
    'Project Title / Innovation Name',
    'text',
    'e.g. Smart IoT Grid for Solar Microgrids',
    '[]'::jsonb,
    true,
    1
  ),
  (
    '66666666-6666-6666-6666-666666666606',
    '55555555-5555-5555-5555-555555555502',
    'domain_area',
    'Research Domain',
    'dropdown',
    'Select domain',
    '["Artificial Intelligence & Robotics", "Green Energy & Sustainability", "Healthcare & Biomedical", "Embedded Systems & IoT", "Civil & Structural Engineering"]'::jsonb,
    true,
    2
  ),
  (
    '66666666-6666-6666-6666-666666666607',
    '55555555-5555-5555-5555-555555555502',
    'power_socket_needed',
    '220V Power Outlet Needed at Booth?',
    'radio',
    '',
    '["Yes (Single Socket)", "Yes (Heavy Load > 1kW)", "No (Battery Operated)"]'::jsonb,
    true,
    3
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Announcements
INSERT INTO public.announcements (festival_id, title, content, priority, target_audience)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Esperenza 2026 Rulebooks Released',
    'Official technical guidelines and dimensions for Robo Race and Young Scientist have been uploaded. Coordinators are advised to verify lab slots.',
    'high',
    'all'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Aashayein 2026 Stage Sound Checks',
    'Amphitheatre audio acoustics rehearsals will begin 3 days before festival opening. Faculty coordinators please coordinate track cues.',
    'normal',
    'coordinators'
  );
