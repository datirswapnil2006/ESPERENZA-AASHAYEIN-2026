import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appStore } from './store';

export const formService = {
  async getFormForEvent(eventId) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('registration_forms')
          .select('*')
          .eq('event_id', eventId)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getFormForEvent error, using store:', err);
      }
    }
    return appStore.forms.find(f => f.event_id === eventId) || null;
  },

  async getFormWithFields(eventIdOrFormId) {
    let form = null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('registration_forms')
          .select('*, form_fields(*)')
          .or(`id.eq.${eventIdOrFormId},event_id.eq.${eventIdOrFormId}`)
          .single();
        if (!error && data) {
          return {
            ...data,
            fields: (data.form_fields || []).sort((a, b) => a.field_order - b.field_order)
          };
        }
      } catch (err) {
        console.warn('Supabase getFormWithFields error, using store:', err);
      }
    }

    form = appStore.forms.find(f => f.id === eventIdOrFormId || f.event_id === eventIdOrFormId);
    if (!form) return null;
    const fields = appStore.formFields
      .filter(f => f.form_id === form.id)
      .sort((a, b) => a.field_order - b.field_order);
    return { ...form, fields };
  },

  async saveForm(formData) {
    if (isSupabaseConfigured) {
      try {
        if (formData.id) {
          const { data, error } = await supabase
            .from('registration_forms')
            .update(formData)
            .eq('id', formData.id)
            .select()
            .single();
          if (!error && data) return data;
        } else {
          const { data, error } = await supabase
            .from('registration_forms')
            .insert([formData])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('Supabase saveForm error, saving to store:', err);
      }
    }
    return appStore.saveForm(formData);
  },

  async saveFormField(fieldData) {
    if (isSupabaseConfigured) {
      try {
        if (fieldData.id && !fieldData.id.startsWith('field-')) {
          const { data, error } = await supabase
            .from('form_fields')
            .update(fieldData)
            .eq('id', fieldData.id)
            .select()
            .single();
          if (!error && data) return data;
        } else {
          const { id, ...insertData } = fieldData;
          const { data, error } = await supabase
            .from('form_fields')
            .insert([insertData])
            .select()
            .single();
          if (!error && data) return data;
        }
      } catch (err) {
        console.warn('Supabase saveFormField error, saving to store:', err);
      }
    }
    return appStore.saveFormField(fieldData);
  },

  async deleteFormField(fieldId) {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('form_fields').delete().eq('id', fieldId);
      } catch (err) {
        console.warn('Supabase deleteFormField error:', err);
      }
    }
    appStore.deleteFormField(fieldId);
  },

  async updateFormStatus(formId, status) {
    return this.saveForm({ id: formId, status });
  }
};
