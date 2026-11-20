import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from './store';

export const eventService = {
  async getFestivals() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('festivals').select('*').order('created_at', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getFestivals error, using store:', err);
      }
    }
    return appStore.festivals;
  },

  async getFestivalBySlug(slug) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('festivals').select('*').eq('slug', slug).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getFestivalBySlug error, using store:', err);
      }
    }
    return appStore.festivals.find(f => f.slug === slug) || null;
  },

  async getAllEvents() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, festivals(name, slug, type)')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(ev => ({
            ...ev,
            festival_slug: ev.festivals?.slug || '',
            festival_name: ev.festivals?.name || ''
          }));
        }
      } catch (err) {
        console.warn('Supabase getAllEvents error, using store:', err);
      }
    }
    return appStore.events;
  },

  async getEventsByFestival(festivalIdOrSlug) {
    const all = await this.getAllEvents();
    return all.filter(e => e.festival_id === festivalIdOrSlug || e.festival_slug === festivalIdOrSlug);
  },

  async getEventBySlug(festivalSlug, eventSlug) {
    const all = await this.getAllEvents();
    return all.find(e => 
      (e.festival_slug === festivalSlug || e.festival_id === festivalSlug) && 
      e.slug === eventSlug
    ) || null;
  },

  async getEventById(eventId) {
    const all = await this.getAllEvents();
    return all.find(e => e.id === eventId) || null;
  },

  async createEvent(eventData) {
    // Generate slug from name
    const slug = eventData.slug || eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const payload = {
      ...eventData,
      slug,
      status: eventData.status || 'upcoming'
    };

    if (isSupabaseConfigured) {
      try {
        // Strip virtual or join fields before sending to Supabase events table
        const { festival_slug, festival_name, festivals, ...dbPayload } = payload;
        const { data, error } = await supabase.from('events').insert([dbPayload]).select().single();
        if (!error && data) {
          appStore.notify('events', { type: 'INSERT', new: data });
          return data;
        }
        if (error) {
          console.warn('Supabase createEvent error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase createEvent exception, persisting to store:', err);
      }
    }
    return appStore.addEvent(payload);
  },

  async updateEvent(eventId, updates) {
    if (isSupabaseConfigured) {
      try {
        // Strip virtual or join fields before sending to Supabase events table
        const { festival_slug, festival_name, festivals, ...dbUpdates } = updates;
        const { data, error } = await supabase.from('events').update(dbUpdates).eq('id', eventId).select().single();
        if (!error && data) {
          appStore.notify('events', { type: 'UPDATE', new: data });
          return data;
        }
        if (error) {
          console.warn('Supabase updateEvent error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase updateEvent error, using store:', err);
      }
    }
    return appStore.updateEvent(eventId, updates);
  },

  async archiveEvent(eventId) {
    return this.updateEvent(eventId, { status: 'archived' });
  },

  subscribeToEvents(callback) {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('public:events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
          callback(payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return appStore.subscribe((event, payload) => {
      if (event === 'events') callback(payload);
    });
  }
};
