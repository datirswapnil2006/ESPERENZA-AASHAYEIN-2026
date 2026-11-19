-- ==============================================================================
-- ESPERENZA & AASHAYEIN 2026-2027: Security & Administrative Stored Procedures
-- ==============================================================================

-- 1. Function for Super Admin to verify or unverify faculty coordinators
CREATE OR REPLACE FUNCTION public.verify_faculty_coordinator(p_user_id UUID, p_verify_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only Super Admin can verify faculty members.';
  END IF;

  UPDATE public.profiles
  SET is_verified = p_verify_status,
      updated_at = NOW()
  WHERE id = p_user_id AND role = 'faculty_coordinator';

  -- Record audit log
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
  VALUES (
    auth.uid(),
    'VERIFY_FACULTY',
    'profiles',
    p_user_id::text,
    jsonb_build_object('is_verified', p_verify_status)
  );
END;
$$;

-- 2. Function to assign a coordinator with historical preservation
CREATE OR REPLACE FUNCTION public.assign_event_coordinator(
  p_event_id UUID,
  p_user_id UUID,
  p_role TEXT,
  p_previous_assignment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Verify authorization: must be admin OR assigned faculty for this event
  IF NOT (public.is_admin() OR public.is_assigned_faculty(p_event_id)) THEN
    RAISE EXCEPTION 'Access denied. Only Super Admin or assigned Faculty can assign coordinators.';
  END IF;

  -- If replacing an existing coordinator assignment, mark previous as 'replaced' instead of deleting
  IF p_previous_assignment_id IS NOT NULL THEN
    UPDATE public.event_assignments
    SET status = 'replaced',
        updated_at = NOW()
    WHERE id = p_previous_assignment_id;
  END IF;

  -- Create new assignment
  INSERT INTO public.event_assignments (event_id, user_id, role, assigned_by, status)
  VALUES (p_event_id, p_user_id, p_role, auth.uid(), 'active')
  RETURNING id INTO v_new_id;

  -- Record audit log
  INSERT INTO public.audit_logs (user_id, event_id, action, table_name, record_id, new_values)
  VALUES (
    auth.uid(),
    p_event_id,
    'ASSIGN_COORDINATOR',
    'event_assignments',
    v_new_id::text,
    jsonb_build_object('role', p_role, 'assigned_user_id', p_user_id, 'previous_id', p_previous_assignment_id)
  );

  RETURN v_new_id;
END;
$$;

-- 3. Function to submit participant with custom dynamic field answers in a single transaction
CREATE OR REPLACE FUNCTION public.submit_participant_registration(
  p_event_id UUID,
  p_form_id UUID,
  p_full_name TEXT,
  p_erp_number TEXT,
  p_email TEXT,
  p_mobile TEXT,
  p_department TEXT,
  p_year TEXT,
  p_section TEXT,
  p_is_team BOOLEAN,
  p_team_name TEXT,
  p_answers JSONB -- Array of objects: [{"field_id": "...", "answer_value": ...}]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id UUID;
  v_item JSONB;
BEGIN
  -- Insert participant record
  INSERT INTO public.participants (
    event_id,
    form_id,
    full_name,
    erp_number,
    email,
    mobile,
    department,
    year,
    section,
    is_team,
    team_name,
    status
  ) VALUES (
    p_event_id,
    p_form_id,
    p_full_name,
    p_erp_number,
    p_email,
    p_mobile,
    p_department,
    p_year,
    p_section,
    COALESCE(p_is_team, false),
    p_team_name,
    'registered'
  )
  RETURNING id INTO v_participant_id;

  -- Insert dynamic answers if present
  IF p_answers IS NOT NULL AND jsonb_array_length(p_answers) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
      INSERT INTO public.participant_answers (
        participant_id,
        field_id,
        answer_value
      ) VALUES (
        v_participant_id,
        (v_item->>'field_id')::UUID,
        v_item->'answer_value'
      );
    END LOOP;
  END IF;

  RETURN v_participant_id;
END;
$$;
