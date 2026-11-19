import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function StudentAssignedEvents() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allEvents, allAssigns] = await Promise.all([
          eventService.getAllEvents(),
          coordinatorService.getAllAssignments()
        ]);

        const myEventIds = (allAssigns || [])
          .filter(a => a.user_id === profile?.id && a.status === 'active')
          .map(a => a.event_id);

        setEvents((allEvents || []).filter(e => myEventIds.includes(e.id)));
        setAssignments(allAssigns || []);
      } catch (err) {
        console.error('Error fetching student events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  if (loading) return <LoadingSkeleton lines={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <h2 className="text-2xl font-black text-navy-blue">My Assigned Competitions</h2>
        <p className="text-xs text-slate-500 mt-1">
          Competitions where you are designated as the student coordinator, co-coordinator, or stage volunteer.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No assigned events linked to your student account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => {
            const faculty = assignments.find(a => a.event_id === evt.id && a.role === 'faculty_coordinator' && a.status === 'active');
            const myAssignment = assignments.find(a => a.event_id === evt.id && a.user_id === profile?.id && a.status === 'active');

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl p-6 border border-light-blue-200 shadow-soft space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-navy-blue text-white">
                    {evt.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'}
                  </span>
                  <span className="text-xs font-bold text-primary-blue bg-light-blue-100 px-2.5 py-0.5 rounded-full">
                    {myAssignment?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-navy-blue">{evt.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.description}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-blue" />
                    <span>Venue: {evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-blue" />
                    <span>Event Date: {new Date(evt.event_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-cream-50 rounded-2xl border text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty In-Charge</span>
                  <span className="font-bold text-navy-blue">{faculty?.profiles?.full_name || 'Designated Faculty'}</span>
                  <span className="block text-slate-500 text-[11px]">{faculty?.profiles?.email}</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to="/student/participants"
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft"
                  >
                    Participant List
                  </Link>
                  <a
                    href={`/events/${evt.festival_slug}/${evt.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border text-slate-600 hover:bg-slate-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
