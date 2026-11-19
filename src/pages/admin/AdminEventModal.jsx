import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import { eventService } from '../../services/eventService';
import { Calendar, Image, MapPin, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminEventModal({ isOpen, onClose, eventToEdit, festivals, onSave }) {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    if (eventToEdit) {
      setValue('name', eventToEdit.name);
      setValue('festival_id', eventToEdit.festival_id);
      setValue('category', eventToEdit.category);
      setValue('description', eventToEdit.description);
      setValue('venue', eventToEdit.venue);
      setValue('image_url', eventToEdit.image_url);
      setValue('event_date', eventToEdit.event_date ? eventToEdit.event_date.slice(0, 16) : '');
      setValue('registration_deadline', eventToEdit.registration_deadline ? eventToEdit.registration_deadline.slice(0, 16) : '');
      setValue('status', eventToEdit.status || 'upcoming');
      setValue('min_team_size', eventToEdit.min_team_size || 1);
      setValue('max_team_size', eventToEdit.max_team_size || 1);
      setValue('rules', eventToEdit.rules || '');
    } else {
      reset({
        name: '',
        festival_id: festivals[0]?.id || '',
        category: 'General',
        description: '',
        venue: 'Main Campus Quadrangle',
        image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        event_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
        registration_deadline: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 16),
        status: 'upcoming',
        min_team_size: 1,
        max_team_size: 1,
        rules: '',
      });
    }
  }, [eventToEdit, isOpen, festivals]);

  const onSubmit = async (data) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const selectedFest = festivals.find(f => f.id === data.festival_id);
      const payload = {
        ...data,
        festival_slug: selectedFest?.slug || '',
        min_team_size: Number(data.min_team_size) || 1,
        max_team_size: Number(data.max_team_size) || 1,
      };

      let result;
      if (eventToEdit) {
        result = await eventService.updateEvent(eventToEdit.id, payload);
      } else {
        result = await eventService.createEvent(payload);
      }

      if (onSave) onSave(result);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? `Edit Event: ${eventToEdit.name}` : 'Create New Festival Event'}
      maxWidth="max-w-2xl"
    >
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-navy-blue mb-1">Target Festival *</label>
            <select
              {...register('festival_id', { required: true })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
            >
              {festivals.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type === 'technical' ? 'Technical' : 'Cultural'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Event Name *</label>
            <input
              type="text"
              {...register('name', { required: true })}
              placeholder="e.g. Hackathon / Street Dance / Drone Grand Prix"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Category / Genre *</label>
            <input
              type="text"
              {...register('category', { required: true })}
              placeholder="e.g. Robotics, Performing Arts, Coding"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Venue *</label>
            <input
              type="text"
              {...register('venue', { required: true })}
              placeholder="e.g. Amphitheatre / Robotics Lab 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Event Date & Time *</label>
            <input
              type="datetime-local"
              {...register('event_date', { required: true })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Registration Deadline *</label>
            <input
              type="datetime-local"
              {...register('registration_deadline', { required: true })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Event Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Min Team</label>
              <input
                type="number"
                min="1"
                {...register('min_team_size')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-navy-blue mb-1">Max Team</label>
              <input
                type="number"
                min="1"
                {...register('max_team_size')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-navy-blue mb-1">Cover Image URL</label>
          <input
            type="url"
            {...register('image_url')}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-navy-blue mb-1">Brief Description *</label>
          <textarea
            rows={3}
            {...register('description', { required: true })}
            placeholder="Explain the objectives, competition format, and audience appeal..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-navy-blue mb-1">Competition Rules & Eligibility (Optional)</label>
          <textarea
            rows={3}
            {...register('rules')}
            placeholder="1. Time limit: 5 mins\n2. External power permissible..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
          />
        </div>

        <div className="pt-3 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft"
          >
            {saving ? 'Saving...' : (eventToEdit ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
