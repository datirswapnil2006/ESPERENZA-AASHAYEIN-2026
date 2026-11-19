import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from './store';

export const auditService = {
  async getAuditLogs(eventId = null) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('audit_logs').select('*, profiles(full_name, email, role)').order('created_at', { ascending: false });
        if (eventId) {
          query = query.eq('event_id', eventId);
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map(log => ({
            ...log,
            user_name: log.profiles?.full_name || 'System / Admin'
          }));
        }
      } catch (err) {
        console.warn('Supabase getAuditLogs error, using store:', err);
      }
    }
    if (eventId) {
      return appStore.auditLogs.filter(l => l.event_id === eventId);
    }
    return appStore.auditLogs;
  },

  async logAction(entry) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert([entry]);
      } catch (err) {
        console.warn('Supabase logAction error:', err);
      }
    }
    return appStore.addAuditLog(entry);
  }
};
