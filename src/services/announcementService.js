import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from './store';

export const announcementService = {
  async getAnnouncements(audience = 'all') {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, festivals(name, slug), events(name, slug)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAnnouncements error, using store:', err);
      }
    }
    if (audience === 'all') return appStore.announcements;
    return appStore.announcements.filter(a => a.target_audience === 'all' || a.target_audience === audience);
  },

  async createAnnouncement(data) {
    if (isSupabaseConfigured) {
      try {
        const { data: res, error } = await supabase
          .from('announcements')
          .insert([data])
          .select()
          .single();
        if (!error && res) return res;
      } catch (err) {
        console.warn('Supabase createAnnouncement error:', err);
      }
    }
    return appStore.addAnnouncement(data);
  }
};
