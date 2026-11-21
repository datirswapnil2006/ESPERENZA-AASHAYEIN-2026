import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { participantService } from '../../services/participantService';
import Modal from '../../components/common/Modal';
import { 
  Calendar, 
  MapPin, 
  Edit3, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function FacultyMyEvents() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedToLink, setSelectedToLink] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  // Edit Event Modal
  const [editingEvent, setEditingEvent] = useState(null);
  const [venue, setVenue] = useState('');
  const [rules, setRules] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [allEvents, allAssigns, allParts] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments(),
        participantService.getAllParticipants()
      ]);

      setAvailableEvents(allEvents || []);

      let myEventIds = (allAssigns || [])
        .filter(a => (a.user_id === profile?.id || a.profiles?.email === profile?.email) && a.status === 'active')
        .map(a => a.event_id);

      // Auto-assign / repair if coordinator has no assigned event yet
      if (myEventIds.length === 0 && allEvents && allEvents.length > 0 && profile?.id) {
        const targetEvent = (profile?.event_id && allEvents.find(e => e.id === profile.event_id))
          || allEvents.find(e => e.slug === 'carnival')
          || allEvents[0];
        if (targetEvent) {
          await coordinatorService.ensureCoordinatorAssignment(profile.id, 'faculty_coordinator', targetEvent.id);
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
      setParticipants(allParts || []);
    } catch (err) {
      console.error('Error loading faculty events:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLinkEvent = async () => {
    if (!selectedToLink || !profile?.id) return;
    setLinking(true);
    try {
      await coordinatorService.assignCoordinator({
        eventId: selectedToLink,
        userId: profile.id,
        role: 'faculty_coordinator',
        assignedBy: profile.id
      });
      await loadData();
    } catch (err) {
      alert('Failed to link event: ' + err.message);
    } finally {
      setLinking(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setVenue(evt.venue || '');
    setRules(evt.rules || '');
    setContactEmail(evt.contact_email || '');
    setContactPhone(evt.contact_phone || '');
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSaving(true);
    try {
      await eventService.updateEvent(editingEvent.id, {
        venue,
        rules,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      });
      setEditingEvent(null);
      loadData();
    } catch (err) {
      alert('Error updating event: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <h2 className="text-2xl font-black text-navy-blue">My Assigned Competitions</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review, update permitted guidelines, venues, and coordinator rosters for your assigned festival events.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-light-blue-200 shadow-soft max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-light-blue-100 text-primary-blue flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-blue">Select Your Assigned Event</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose the festival event you are coordinating to immediately unlock form configuration, coordinator assignments, and participant management.
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
              No festival events found in the database. Super Admin can add events from the Admin Console.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((evt) => {
            const evtCoords = assignments.filter(a => a.event_id === evt.id && a.status === 'active');
            const evtParts = participants.filter(p => p.event_id === evt.id);

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-navy-blue text-white">
                        {evt.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-light-blue-100 text-primary-blue">
                        {evt.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-navy-blue">{evt.name}</h3>
                    <p className="text-xs text-slate-500 max-w-2xl">{evt.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(evt)}
                      className="px-4 py-2 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Permitted Details</span>
                    </button>
                    <a
                      href={`/events/${evt.festival_slug}/${evt.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                      title="Public Event Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & Schedule</span>
                    <div className="font-bold text-navy-blue mt-1">{evt.venue}</div>
                    <div className="text-slate-500 mt-0.5">{new Date(evt.event_date).toLocaleDateString()}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Coordinator Cohort</span>
                    <div className="font-bold text-navy-blue mt-1">{evtCoords.length} Active Staff & Students</div>
                    <div className="text-primary-blue font-semibold mt-0.5">Faculty Lead: {profile.full_name}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Participant Influx</span>
                    <div className="font-bold text-emerald-600 mt-1">{evtParts.length} Registered</div>
                    <div className="text-slate-500 mt-0.5">Max Team: {evt.max_team_size || 1}</div>
                  </div>
                </div>

                {/* Rules */}
                {evt.rules && (
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-navy-blue">Competition Rules & Judging Criteria:</span>
                    <div className="bg-slate-50 p-4 rounded-2xl border text-slate-600 font-mono text-[11px] whitespace-pre-line">
                      {evt.rules}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Permitted Event Modal */}
      {editingEvent && (
        <Modal
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          title={`Update Permitted Details: ${editingEvent.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Assigned Venue *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Amphitheatre / Robotics Lab 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-navy-blue mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="event@college.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-blue mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Competition Rules & Eligibility Guidelines</label>
              <textarea
                rows={4}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Rules..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
