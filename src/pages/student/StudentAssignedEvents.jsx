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
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedToLink, setSelectedToLink] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [allEvents, allAssigns] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments()
      ]);

      setAvailableEvents(allEvents || []);

      let myEventIds = (allAssigns || [])
        .filter(a => (a.user_id === profile?.id || a.profiles?.email === profile?.email) && a.status === 'active')
        .map(a => a.event_id);

      // Auto-assign / repair if student coordinator has no assigned event yet
      if (myEventIds.length === 0 && allEvents && allEvents.length > 0 && profile?.id) {
        const targetEvent = (profile?.event_id && allEvents.find(e => e.id === profile.event_id))
          || allEvents.find(e => e.slug === 'carnival')
          || allEvents[0];
        if (targetEvent) {
          await coordinatorService.ensureCoordinatorAssignment(profile.id, 'student_coordinator', targetEvent.id);
          myEventIds = [targetEvent.id];
          const freshAssigns = await coordinatorService.getAllAssignments();
          setAssignments(freshAssigns || []);
        }
      }

      let matchedEvents = (allEvents || []).filter(e => myEventIds.includes(e.id));
      if (matchedEvents.length === 0 && allEvents && allEvents.length > 0) {
        matchedEvents = allEvents;
      }
      setEvents(matchedEvents);
      if (allAssigns) {
        setAssignments(allAssigns);
      }
    } catch (err) {
      console.error('Error fetching student events:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleLinkEvent = async () => {
    if (!selectedToLink || !profile?.id) return;
    setLinking(true);
    try {
      await coordinatorService.assignCoordinator({
        eventId: selectedToLink,
        userId: profile.id,
        role: 'student_coordinator',
        assignedBy: profile.id
      });
      await loadData();
    } catch (err) {
      alert('Failed to link event: ' + err.message);
    } finally {
      setLinking(false);
    }
  };

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
        <div className="bg-white rounded-3xl p-12 text-center border border-light-blue-200 shadow-soft max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-light-blue-100 text-primary-blue flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-blue">Select Your Assigned Event</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Link your student coordinator account to a competition to view participants, edit event guidelines, and add student co-coordinators.
          </p>
          {availableEvents.length > 0 ? (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <select
                value={selectedToLink}
                onChange={(e) => setSelectedToLink(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-light-blue-200 text-xs font-semibold bg-white text-navy-blue focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="">-- Choose Festival Event --</option>
                {availableEvents.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'})
                  </option>
                ))}
              </select>
              <button
                onClick={handleLinkEvent}
                disabled={!selectedToLink || linking}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover disabled:opacity-50 text-white text-xs font-bold transition-all"
              >
                {linking ? 'Linking...' : 'Link Event'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-semibold">
              No festival events found in the database.
            </p>
          )}
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
                  <div className="flex-1 grid grid-cols-3 gap-1.5">
                    <Link
                      to="/student/forms"
                      className="text-center py-2 px-2 rounded-xl bg-light-blue-100 hover:bg-light-blue-200 text-primary-blue text-xs font-bold transition-all truncate"
                    >
                      Form
                    </Link>
                    <Link
                      to="/student/coordinators"
                      className="text-center py-2 px-2 rounded-xl bg-light-blue-100 hover:bg-light-blue-200 text-primary-blue text-xs font-bold transition-all truncate"
                    >
                      + Co-Coords
                    </Link>
                    <Link
                      to="/student/participants"
                      className="text-center py-2 px-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all truncate"
                    >
                      Participants
                    </Link>
                  </div>
                  <a
                    href={`/events/${evt.festival_slug}/${evt.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border text-slate-600 hover:bg-slate-50 shrink-0"
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
