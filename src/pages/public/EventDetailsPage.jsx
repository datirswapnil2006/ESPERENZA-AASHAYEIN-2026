import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  Mail, 
  Phone,
  Sparkles
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function EventDetailsPage() {
  const { festivalSlug, eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEventDetails() {
      setLoading(true);
      try {
        const ev = await eventService.getEventBySlug(festivalSlug, eventSlug);
        if (ev) {
          setEvent(ev);
          const assignList = await coordinatorService.getAssignmentsByEvent(ev.id);
          setAssignments(assignList.filter(a => a.status === 'active'));
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [festivalSlug, eventSlug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h3 className="text-xl font-bold text-navy-blue">Event Not Found</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested competition does not exist or has been archived.</p>
        <Link to="/" className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold">
          Return to Festival Home
        </Link>
      </div>
    );
  }

  const facultyCoordinators = assignments.filter(a => a.role === 'faculty_coordinator');
  const studentCoordinators = assignments.filter(a => a.role === 'student_coordinator');
  const coCoordinators = assignments.filter(a => ['co_coordinator', 'volunteer'].includes(a.role));

  const isTech = event.festival_slug === 'esperanza';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      
      {/* Back button */}
      <Link
        to={isTech ? '/esperanza' : '/aashayein'}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {isTech ? 'Esperenza' : 'Aashayein'}</span>
      </Link>

      {/* Main Hero Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-light-blue-200 shadow-soft-lg grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide text-white ${
                isTech ? 'bg-primary-blue' : 'bg-navy-blue'
              }`}>
                {isTech ? 'Esperenza 2026' : 'Aashayein 2026'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-light-blue-100 text-primary-blue">
                {event.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-navy-blue leading-tight">
              {event.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Key Event Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-primary-blue shrink-0" />
              <span><strong>Venue:</strong> {event.venue}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-primary-blue shrink-0" />
              <span><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-primary-blue shrink-0" />
              <span><strong>Deadline:</strong> {new Date(event.registration_deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-primary-blue shrink-0" />
              <span><strong>Team:</strong> {event.max_team_size > 1 ? `${event.min_team_size} - ${event.max_team_size} Members` : 'Solo Individual'}</span>
            </div>
          </div>

          {/* Action to Register */}
          <div className="pt-4">
            <Link
              to={`/register/${festivalSlug}/${eventSlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all"
            >
              <span>Register for this Event</span>
              <CheckCircle2 className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Thumbnail */}
        <div className="lg:col-span-5 relative min-h-[300px] bg-slate-100">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Rules & Guidelines */}
      {event.rules && (
        <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft space-y-4">
          <h3 className="text-lg font-black text-navy-blue flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-blue" />
            <span>Official Event Rules & Guidelines</span>
          </h3>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-cream-50 p-6 rounded-2xl border border-light-blue-200/60 font-mono">
            {event.rules}
          </div>
        </div>
      )}

      {/* Coordinators Section */}
      <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft space-y-6">
        <div>
          <h3 className="text-lg font-black text-navy-blue flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-blue" />
            <span>Event Management & Coordination Team</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Faculty leads, student coordinators, and volunteer leads assigned to this competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Faculty Leads */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty In-Charge</h4>
            {facultyCoordinators.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No faculty lead assigned</p>
            ) : (
              facultyCoordinators.map(a => (
                <div key={a.id} className="p-4 rounded-2xl bg-light-blue-50/70 border border-light-blue-200 space-y-1 text-xs">
                  <div className="font-bold text-navy-blue">{a.profiles?.full_name}</div>
                  <div className="text-primary-blue font-medium">{a.profiles?.designation || 'Faculty Coordinator'}</div>
                  <div className="text-slate-500">{a.profiles?.department}</div>
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary-blue" />
                    <span>{a.profiles?.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Student Leads */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Lead</h4>
            {studentCoordinators.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No student lead assigned</p>
            ) : (
              studentCoordinators.map(a => (
                <div key={a.id} className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-1 text-xs">
                  <div className="font-bold text-navy-blue">{a.profiles?.full_name}</div>
                  <div className="text-navy-blue font-semibold">Main Student Coordinator</div>
                  <div className="text-slate-500">{a.profiles?.department} ({a.profiles?.year || 'Student'})</div>
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary-blue" />
                    <span>{a.profiles?.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Co-Coordinators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Co-Coordinators</h4>
            {coCoordinators.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No co-coordinators assigned</p>
            ) : (
              coCoordinators.map(a => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-bold text-navy-blue">{a.profiles?.full_name}</div>
                  <div className="text-slate-500 font-medium capitalize">{a.role.replace('_', ' ')}</div>
                  <div className="text-[11px] text-slate-400">{a.profiles?.department}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
