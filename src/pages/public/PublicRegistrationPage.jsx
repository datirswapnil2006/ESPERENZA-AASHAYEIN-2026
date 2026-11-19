import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { formService } from '../../services/formService';
import DynamicFormRenderer from '../../components/forms/DynamicFormRenderer';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function PublicRegistrationPage() {
  const { festivalSlug, eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEventAndForm() {
      setLoading(true);
      try {
        const ev = await eventService.getEventBySlug(festivalSlug, eventSlug);
        if (ev) {
          setEvent(ev);
          const formWithFields = await formService.getFormWithFields(ev.id);
          setForm(formWithFields);
        }
      } catch (err) {
        console.error('Error loading registration page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEventAndForm();
  }, [festivalSlug, eventSlug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h3 className="text-xl font-bold text-navy-blue">Event Not Found</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6">Unable to find competition registration portal.</p>
        <Link to="/" className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold">
          Festival Home
        </Link>
      </div>
    );
  }

  const isClosed = form && form.status === 'closed';
  const isPastDeadline = event.registration_deadline && new Date() > new Date(event.registration_deadline);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      
      {/* Back link */}
      <Link
        to={`/events/${festivalSlug}/${eventSlug}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event Details</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-navy-blue text-white">
              {event.festival_slug === 'esperanza' ? 'Esperenza 2026' : 'Aashayein 2026'}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-light-blue-100 text-primary-blue">
              {event.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Clock className="w-4 h-4 text-primary-blue" />
            <span>Deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-navy-blue">
          Participant Registration: {event.name}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {form?.description || event.description}
        </p>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary-blue" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-blue" />
            <span>Event Date: {new Date(event.event_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Registration Status Check */}
      {isClosed || isPastDeadline ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-navy-blue">Registrations Closed</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Online participant registration for {event.name} is currently closed. If you have any inquiries, please contact the faculty coordinator or event help desk.
          </p>
          <div className="pt-2">
            <Link to="/" className="px-5 py-2.5 bg-navy-blue text-white rounded-xl text-xs font-bold">
              Explore Other Competitions
            </Link>
          </div>
        </div>
      ) : (
        /* Dynamic Form Renderer */
        <DynamicFormRenderer
          event={event}
          form={form}
          onSuccess={(result) => {
            console.log('Registered successfully:', result);
          }}
        />
      )}

    </div>
  );
}
