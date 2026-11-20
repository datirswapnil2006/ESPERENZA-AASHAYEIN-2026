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
    const norm = (slug === 'esperenza' || slug === 'esperanza') ? 'esperanza' : slug;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('festivals').select('*').or(`slug.eq.${norm},slug.eq.${slug}`).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getFestivalBySlug error, using store:', err);
      }
    }
    return appStore.festivals.find(f => f.slug === norm || f.slug === slug) || null;
  },

  async getAllEvents() {
    let dbEvents = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, festivals(name, slug, type)')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          dbEvents = data.map(ev => ({
            ...ev,
            festival_slug: ev.festivals?.slug || ev.festival_slug || (ev.festival_id === '11111111-1111-1111-1111-111111111111' ? 'esperanza' : ev.festival_id === '22222222-2222-2222-2222-222222222222' ? 'aashayein' : ''),
            festival_name: ev.festivals?.name || (ev.festival_id === '11111111-1111-1111-1111-111111111111' ? 'Esperenza' : ev.festival_id === '22222222-2222-2222-2222-222222222222' ? 'Aashayein' : '')
          }));
        } else if (error) {
          console.warn('Supabase getAllEvents query warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getAllEvents error, using store:', err);
      }
    }

    // Seamlessly merge database events with local reactive store
    const mergedMap = new Map();
    (appStore.events || []).forEach(e => { if (e && e.id) mergedMap.set(e.id, e); });
    dbEvents.forEach(e => { if (e && e.id) mergedMap.set(e.id, e); });

    return Array.from(mergedMap.values());
  },

  async getEventsByFestival(festivalIdOrSlug) {
    const all = await this.getAllEvents();
    const query = (festivalIdOrSlug || '').toLowerCase();
    return all.filter(e => {
      const eFestId = (e.festival_id || '').toLowerCase();
      const eFestSlug = (e.festival_slug || '').toLowerCase();
      if (eFestId === query || eFestSlug === query) return true;
      if (query.startsWith('esper') && (eFestSlug.startsWith('esper') || eFestId === '11111111-1111-1111-1111-111111111111')) return true;
      if (query.startsWith('aash') && (eFestSlug.startsWith('aash') || eFestId === '22222222-2222-2222-2222-222222222222')) return true;
      return false;
    });
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
    const baseSlug = (eventData.slug || eventData.name || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'event';

    // Check existing events in store/memory to avoid slug collision
    const existingEvents = await this.getAllEvents();
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (existingEvents.some(e => e.festival_id === eventData.festival_id && e.slug === uniqueSlug)) {
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    const payload = {
      ...eventData,
      slug: uniqueSlug,
      status: eventData.status || 'upcoming'
    };

    if (isSupabaseConfigured) {
      try {
        // Strip virtual or join fields before sending to Supabase events table
        const { festival_slug, festival_name, festivals, ...dbPayload } = payload;
        let { data, error } = await supabase.from('events').insert([dbPayload]).select().single();

        // Auto-resolve duplicate key collision (error 23505) by appending unique suffix and retrying
        if (error && (error.code === '23505' || error.message?.includes('unique_festival_event_slug') || error.message?.includes('duplicate key'))) {
          const fallbackSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
          dbPayload.slug = fallbackSlug;
          payload.slug = fallbackSlug;
          const retryRes = await supabase.from('events').insert([dbPayload]).select().single();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (!error && data) {
          const augmented = {
            ...data,
            festival_slug: payload.festival_slug || '',
            festival_name: payload.festival_name || ''
          };
          appStore.events.unshift(augmented);
          appStore.notify('events', { type: 'INSERT', new: augmented });
          return augmented;
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
