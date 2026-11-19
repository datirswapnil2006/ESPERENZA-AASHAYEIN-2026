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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('event_assignments')
          .select(`
            *,
            profiles:user_id(id, full_name, email, mobile, department, erp_number, year, section, employee_id, designation),
            events:event_id(id, name, slug, festival_id)
          `)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllAssignments error, using store:', err);
      }
    }
    // Enrich local assignments with user and event data
    return appStore.assignments.map(assign => {
      const user = appStore.profiles.find(p => p.id === assign.user_id);
      const event = appStore.events.find(e => e.id === assign.event_id);
      return {
        ...assign,
        profiles: user,
        events: event,
      };
    });
  },

  async getAssignmentsByEvent(eventId) {
    const all = await this.getAllAssignments();
    return all.filter(a => a.event_id === eventId);
  },

  async assignCoordinator({ eventId, userId, role, assignedBy, previousAssignmentId }) {
    if (isSupabaseConfigured) {
      try {
        // Use RPC function if present
        const { data, error } = await supabase.rpc('assign_event_coordinator', {
          p_event_id: eventId,
          p_user_id: userId,
          p_role: role,
          p_previous_assignment_id: previousAssignmentId || null
        });
        if (!error && data) return { id: data };
      } catch (err) {
        console.warn('RPC assign_event_coordinator error, falling back to direct table update/store:', err);
      }
    }
    return appStore.assignCoordinator({ eventId, userId, role, assignedBy, previousAssignmentId });
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
