import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { participantService } from '../../services/participantService';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { reportService } from '../../services/reportService';
import Modal from '../../components/common/Modal';
import { 
  ClipboardList, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Users, 
  Eye, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function FacultyParticipants() {
  const { profile } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectTarget, setInspectTarget] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [allEvents, allAssigns, allParts] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments(),
        participantService.getAllParticipants()
      ]);

      const myEventIds = (allAssigns || [])
        .filter(a => a.user_id === profile?.id && a.role === 'faculty_coordinator' && a.status === 'active')
        .map(a => a.event_id);

      const myEvents = (allEvents || []).filter(e => myEventIds.includes(e.id));
      setEvents(myEvents);

      if (myEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(myEvents[0].id);
      }

      const myParts = (allParts || []).filter(p => myEventIds.includes(p.event_id));
      setParticipants(myParts);
    } catch (err) {
      console.error('Error fetching faculty participants:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const unsub = participantService.subscribeToParticipants(() => loadData());
    return () => unsub();
  }, [profile]);

  const handleStatusChange = async (participantId, newStatus) => {
    try {
      await participantService.updateParticipantStatus(participantId, newStatus);
      loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];

  const filtered = participants.filter((p) => {
    const matchesEvent = !selectedEventId || p.event_id === selectedEventId;
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.erp_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>ENROLLMENT REPOSITORY</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Assigned Event Participants</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review submissions, inspect custom field answers, confirm teams, and download permitted rosters.
          </p>
        </div>

        {currentEvent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => reportService.exportParticipants('csv', { eventId: currentEvent.id, eventName: currentEvent.name })}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              CSV
            </button>
            <button
              onClick={() => reportService.exportParticipants('xlsx', { eventId: currentEvent.id, eventName: currentEvent.name })}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export {currentEvent.name} Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Event Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-light-blue-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or ERP..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {events.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No registrations received yet for this competition.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-light-blue-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Participant Student</th>
                  <th className="py-4 px-6">ERP & Academics</th>
                  <th className="py-4 px-6">Format & Team</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-navy-text">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-light-blue-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-navy-blue text-sm">{p.full_name}</div>
                      <div className="text-slate-500">{p.email}</div>
                      <div className="text-[11px] text-slate-400">{p.mobile}</div>
                    </td>

                    <td className="py-4 px-6 font-mono">
                      <div className="font-bold text-navy-blue">{p.erp_number}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{p.department} ({p.year})</div>
                    </td>

                    <td className="py-4 px-6">
                      {p.is_team ? (
                        <span className="inline-flex items-center gap-1 text-primary-blue font-bold text-[11px]">
                          <Users className="w-3.5 h-3.5" />
                          <span>Team: {p.team_name || 'Group'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Solo Entry</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={p.status || 'registered'}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          p.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : p.status === 'attended'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="registered">Registered</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="attended">Attended</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectTarget(p)}
                        className="px-3 py-1.5 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectTarget && (
        <Modal
          isOpen={Boolean(inspectTarget)}
          onClose={() => setInspectTarget(null)}
          title={`Participant Inspection: ${inspectTarget.full_name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-cream-50 p-4 rounded-2xl border space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-navy-blue">{inspectTarget.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ERP Number:</span>
                <span className="font-mono font-bold text-navy-blue">{inspectTarget.erp_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-navy-blue">{inspectTarget.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-semibold text-navy-blue">{inspectTarget.mobile}</span>
              </div>
            </div>

            {inspectTarget.answers && Object.keys(inspectTarget.answers).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-navy-blue border-b pb-1">Custom Form Answers</h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border space-y-2">
                  {Object.entries(inspectTarget.answers).map(([key, val], idx) => (
                    <div key={idx} className="border-b last:border-0 pb-1.5 last:pb-0">
                      <span className="text-[11px] text-slate-400 block">Question {idx + 1}</span>
                      <span className="font-semibold text-navy-blue">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectTarget(null)}
                className="px-4 py-2 bg-navy-blue text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
