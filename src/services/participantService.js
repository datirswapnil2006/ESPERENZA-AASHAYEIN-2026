import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from './store';

export const participantService = {
  async getAllParticipants() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('participants')
          .select('*, events(id, name, slug, festival_id, festivals(name, slug))')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(p => ({
            ...p,
            event_name: p.events?.name,
            festival_name: p.events?.festivals?.name,
            festival_slug: p.events?.festivals?.slug
          }));
        }
      } catch (err) {
        console.warn('Supabase getAllParticipants error, using store:', err);
      }
    }
    return appStore.participants.map(p => {
      const event = appStore.events.find(e => e.id === p.event_id);
      const festival = appStore.festivals.find(f => f.id === event?.festival_id);
      return {
        ...p,
        event_name: event?.name || 'Unknown Event',
        festival_name: festival?.name || 'Unknown Festival',
        festival_slug: festival?.slug || ''
      };
    });
  },

  async getParticipantsByEvent(eventId) {
    const all = await this.getAllParticipants();
    return all.filter(p => p.event_id === eventId);
  },

  async submitRegistration(registrationData) {
    const { event_id, erp_number, answers, ...rest } = registrationData;

    // Check duplicate submissions per event
    const existing = await this.getParticipantsByEvent(event_id);
    const isDuplicate = existing.some(
      p => p.erp_number?.toLowerCase().trim() === erp_number?.toLowerCase().trim()
    );

    if (isDuplicate) {
      throw new Error(`ERP Number "${erp_number}" is already registered for this event.`);
    }

    if (isSupabaseConfigured) {
      try {
        // Try transactional RPC first
        const formattedAnswers = answers
          ? Object.entries(answers).map(([field_id, answer_value]) => ({
              field_id,
              answer_value
            }))
          : [];

        const { data, error } = await supabase.rpc('submit_participant_registration', {
          p_event_id: event_id,
          p_form_id: rest.form_id || null,
          p_full_name: rest.full_name,
          p_erp_number: erp_number,
          p_email: rest.email,
          p_mobile: rest.mobile,
          p_department: rest.department,
          p_year: rest.year,
          p_section: rest.section,
          p_is_team: Boolean(rest.is_team),
          p_team_name: rest.team_name || null,
          p_answers: formattedAnswers
        });

        if (!error && data) {
          const newPart = { id: data, event_id, erp_number, answers, ...rest };
          appStore.addParticipant(newPart);
          return newPart;
        }
      } catch (err) {
        console.warn('RPC submit_participant_registration failed, falling back to local store:', err);
      }
    }

    const newPart = appStore.addParticipant({
      event_id,
      erp_number,
      answers,
      ...rest
    });
    return newPart;
  },

  async updateParticipantStatus(participantId, status) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('participants')
          .update({ status })
          .eq('id', participantId)
          .select()
          .single();
        if (!error && data) {
          appStore.updateParticipantStatus(participantId, status);
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateParticipantStatus error, using store:', err);
      }
    }
    return appStore.updateParticipantStatus(participantId, status);
  },

  subscribeToParticipants(callback) {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('public:participants')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, (payload) => {
          callback(payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return appStore.subscribe((event, payload) => {
      if (event === 'participants') callback(payload);
    });
  }
};
