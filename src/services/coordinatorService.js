import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from './store';

export const coordinatorService = {
  async getAllProfiles() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllProfiles error, using store:', err);
      }
    }
    return appStore.profiles;
  },

  async getFacultyCoordinators() {
    const all = await this.getAllProfiles();
    return all.filter(p => p.role === 'faculty_coordinator');
  },

  async getStudentCoordinators() {
    const all = await this.getAllProfiles();
    return all.filter(p => p.role === 'student_coordinator');
  },

  async getAllAssignments() {
    let supabaseAssignments = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('event_assignments')
          .select(`
            *,
            profiles:user_id(id, full_name, email, mobile, department, erp_number, year, section, employee_id, designation),
            events:event_id(id, name, slug, festival_id)
          `)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          supabaseAssignments = data;
        }
      } catch (err) {
        console.warn('Supabase getAllAssignments error, using store:', err);
      }
    }

    // Enrich local assignments with user and event data
    const localEnriched = appStore.assignments.map(assign => {
      const user = appStore.profiles.find(p => p.id === assign.user_id);
      const event = appStore.events.find(e => e.id === assign.event_id);
      return {
        ...assign,
        profiles: user,
        events: event,
      };
    });

    const map = new Map();
    supabaseAssignments.forEach(a => map.set(a.id || `${a.event_id}-${a.user_id}`, a));
    localEnriched.forEach(a => {
      const key = a.id || `${a.event_id}-${a.user_id}`;
      if (!map.has(key)) map.set(key, a);
    });

    return Array.from(map.values());
  },

  async getAssignmentsByEvent(eventId) {
    const all = await this.getAllAssignments();
    return all.filter(a => a.event_id === eventId);
  },

  async assignCoordinator({ eventId, userId, role, assignedBy, previousAssignmentId }) {
    const roleValue = role || 'faculty_coordinator';
    const assignedByValue = assignedBy || userId;

    if (isSupabaseConfigured && supabase) {
      try {
        if (previousAssignmentId) {
          await supabase.from('event_assignments').update({ status: 'replaced', updated_at: new Date().toISOString() }).eq('id', previousAssignmentId);
        }

        // Check if an existing assignment exists for this user and event
        const { data: existing } = await supabase
          .from('event_assignments')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle();

        let data = null;
        let error = null;

        if (existing) {
          const res = await supabase
            .from('event_assignments')
            .update({ role: roleValue, status: 'active', updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase
            .from('event_assignments')
            .insert([{
              event_id: eventId,
              user_id: userId,
              role: roleValue,
              status: 'active',
              assigned_by: assignedByValue
            }])
            .select()
            .single();
          data = res.data;
          error = res.error;
        }

        if (!error && data) {
          appStore.assignCoordinator({ eventId, userId, role: roleValue, assignedBy: assignedByValue, previousAssignmentId });
          return data;
        }
      } catch (directErr) {
        console.warn('Direct Supabase assignCoordinator error, trying RPC fallback:', directErr);
      }

      try {
        // Fallback to RPC function if available
        const { data, error } = await supabase.rpc('assign_event_coordinator', {
          p_event_id: eventId,
          p_user_id: userId,
          p_role: roleValue,
          p_previous_assignment_id: previousAssignmentId || null
        });
        if (!error && data) return { id: data };
      } catch (err) {
        console.warn('RPC assign_event_coordinator error, falling back to local store:', err);
      }
    }
    return appStore.assignCoordinator({ eventId, userId, role: roleValue, assignedBy: assignedByValue, previousAssignmentId });
  },

  async ensureCoordinatorAssignment(userId, role, eventId) {
    if (!userId || !eventId) return null;
    const all = await this.getAllAssignments();
    const existing = all.find(a => a.user_id === userId && a.event_id === eventId && a.status === 'active');
    if (existing) return existing;
    return await this.assignCoordinator({
      eventId,
      userId,
      role: role || 'faculty_coordinator',
      assignedBy: userId
    });
  },

  async replaceCoordinator({ previousAssignmentId, eventId, userId, role, assignedBy }) {
    return this.assignCoordinator({
      eventId,
      userId,
      role,
      assignedBy,
      previousAssignmentId
    });
  },

  async removeAssignment(assignmentId) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('event_assignments').update({ status: 'inactive' }).eq('id', assignmentId);
      } catch (err) {
        console.warn('Supabase removeAssignment error, updating store:', err);
      }
    }
    appStore.removeAssignment(assignmentId);
  },

  async verifyFaculty(userId, isVerified) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc('verify_faculty_coordinator', {
          p_user_id: userId,
          p_verify_status: isVerified
        });
        if (!error) {
          appStore.verifyFaculty(userId, isVerified);
          return true;
        }
      } catch (err) {
        console.warn('RPC verify_faculty error, falling back to direct update:', err);
      }
      try {
        await supabase.from('profiles').update({ is_verified: isVerified }).eq('id', userId);
      } catch (err) {
        console.warn('Supabase direct profile verify error, using store:', err);
      }
    }
    return appStore.verifyFaculty(userId, isVerified);
  },

  subscribeToAssignments(callback) {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('public:event_assignments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'event_assignments' }, (payload) => {
          callback(payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return appStore.subscribe((event, payload) => {
      if (event === 'assignments') callback(payload);
    });
  }
};
