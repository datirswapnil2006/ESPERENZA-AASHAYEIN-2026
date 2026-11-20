import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import { eventService } from '../../services/eventService';
import { 
  Calendar, 
  Image as ImageIcon, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  Users, 
  Clock, 
  Layers, 
  FileText,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function AdminEventModal({ isOpen, onClose, eventToEdit, festivals, onSave }) {
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const currentImageUrl = watch('image_url');
  const currentFestivalId = watch('festival_id');

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
        category: 'Performing Arts',
        description: '',
        venue: 'Main Campus Quadrangle & Stage',
        image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        event_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
        registration_deadline: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 16),
        status: 'upcoming',
        min_team_size: 1,
        max_team_size: 1,
        rules: '',
      });
    }
  }, [eventToEdit, isOpen, festivals, reset, setValue]);

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

  const selectedFestival = festivals.find(f => f.id === currentFestivalId) || festivals[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-blue/15 text-primary-blue flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-navy-blue">
              {eventToEdit ? `Edit Event: ${eventToEdit.name}` : 'Create New Festival Event'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Add competition details, venues, schedules and participation capacity
            </div>
          </div>
        </div>
      }
      maxWidth="max-w-3xl"
    >
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
        
        {/* SECTION 1: FESTIVAL & CORE DETAILS */}
        <div className="bg-cream-50/70 p-4 rounded-2xl border border-light-blue-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-navy-blue flex items-center gap-1.5 text-xs">
              <Layers className="w-4 h-4 text-primary-blue" />
              <span>Festival & Competition Details</span>
            </h4>
            {selectedFestival && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                selectedFestival.type === 'technical' 
                  ? 'bg-light-blue-100 text-primary-blue border border-light-blue-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {selectedFestival.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Target Festival *</label>
              <select
                {...register('festival_id', { required: true })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs focus:ring-2 focus:ring-primary-blue focus:outline-none"
              >
                {festivals.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.type === 'technical' ? 'Technical Festival' : 'Cultural Festival'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Event Name *</label>
              <input
                type="text"
                {...register('name', { required: true })}
                placeholder="e.g. Young Scientist / Street Dance / Drone Racing"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-primary-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Category / Genre *</label>
              <input
                type="text"
                {...register('category', { required: true })}
                placeholder="e.g. Robotics, Performing Arts, Coding, Fine Arts"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Venue / Hall *</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('venue', { required: true })}
                  placeholder="e.g. Main Auditorium / Robotics Arena"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SCHEDULE, CAPACITY & STATUS */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3.5">
          <h4 className="font-extrabold text-navy-blue flex items-center gap-1.5 text-xs">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Schedule, Status & Team Capacity</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Event Date & Time *</label>
              <input
                type="datetime-local"
                {...register('event_date', { required: true })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Registration Deadline *</label>
              <input
                type="datetime-local"
                {...register('registration_deadline', { required: true })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Event Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-primary-blue focus:outline-none"
              >
                <option value="upcoming">Upcoming (Accepting registrations)</option>
                <option value="ongoing">Ongoing (Festival in session)</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived (Closed to new coordinators)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-navy-blue mb-1">Min Team Size</label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    {...register('min_team_size')}
                    className="w-full pl-7 pr-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-navy-blue mb-1">Max Team Size</label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    {...register('max_team_size')}
                    className="w-full pl-7 pr-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MEDIA, RULES & DESCRIPTION */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5">
          <h4 className="font-extrabold text-navy-blue flex items-center gap-1.5 text-xs">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Description, Poster & Rules</span>
          </h4>

          {/* Cover Image URL with Live Thumbnail Preview */}
          <div>
            <label className="block font-bold text-navy-blue mb-1">Cover Image URL</label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  {...register('image_url')}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
                />
              </div>
              {currentImageUrl && (
                <div className="w-12 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img 
                    src={currentImageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Brief Description *</label>
            <textarea
              rows={2}
              {...register('description', { required: true })}
              placeholder="Highlight the objectives, theme, judging criteria and participant takeaways..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-primary-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1">Competition Rules & Eligibility (Optional)</label>
            <textarea
              rows={2}
              {...register('rules')}
              placeholder="1. Time limit: 5 minutes per performance&#10;2. College ID card mandatory for stage entry"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary-blue focus:outline-none"
            />
          </div>
        </div>

        {/* MODAL FOOTER BUTTONS (Always in view) */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            * Fields required for public registrations
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{eventToEdit ? 'Update Event' : 'Create Event'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
}
