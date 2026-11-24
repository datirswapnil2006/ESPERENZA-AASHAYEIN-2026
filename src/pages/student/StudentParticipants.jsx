import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { participantService } from '../../services/participantService';
import { coordinatorService } from '../../services/coordinatorService';
import { eventService } from '../../services/eventService';
import { COLLEGE_DEPARTMENTS, matchDepartment } from '../../utils/departments';
import Modal from '../../components/common/Modal';
import { ClipboardList, Search, Users, Eye, CheckCircle2, Phone, Mail } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function StudentParticipants() {
  const { profile } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectTarget, setInspectTarget] = useState(null);
  const [deptFilter, setDeptFilter] = useState(profile?.department || 'all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allEvents, allAssigns, allParts] = await Promise.all([
          eventService.getAllEvents(),
          coordinatorService.getAllAssignments(),
          participantService.getAllParticipants()
        ]);

        let myEventIds = (allAssigns || [])
          .filter(a => a.user_id === profile?.id && a.status === 'active')
          .map(a => a.event_id);

        if (myEventIds.length === 0 && allEvents && allEvents.length > 0 && profile?.id) {
          const targetEvent = (profile?.event_id && allEvents.find(e => e.id === profile.event_id)) || allEvents[0];
          if (targetEvent) {
            myEventIds = [targetEvent.id];
          }
        }

        let myEvents = (allEvents || []).filter(e => myEventIds.includes(e.id));
        if (myEvents.length === 0 && allEvents && allEvents.length > 0) {
          myEvents = allEvents;
        }
        setEvents(myEvents);
        if (myEvents.length > 0 && !selectedEventId) {
          setSelectedEventId(myEvents[0].id);
        }

        const activeEvtIds = myEvents.map(e => e.id);
        const myParts = (allParts || []).filter(p => activeEvtIds.includes(p.event_id));
        setParticipants(myParts);
      } catch (err) {
        console.error('Error fetching student participants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  const currentEvent = events.find(e => e.id === selectedEventId) || events[0];
  const isCarnival = currentEvent?.slug === 'carnival' || currentEvent?.name?.toLowerCase().includes('carnival');

  const filtered = participants.filter((p) => {
    const matchesEvent = !selectedEventId || p.event_id === selectedEventId;
    const matchesSearch = p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.erp_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.team_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !isCarnival || !profile?.department || matchDepartment(p.department, profile.department);
    return matchesEvent && matchesSearch && matchesDept;
  });

  if (loading) return <LoadingSkeleton lines={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>PARTICIPANT ROSTER</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Assigned Competition Participants</h2>
          <p className="text-xs text-slate-500 mt-1">
            Student participant verification and attendance check for your assigned events.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 bg-primary-blue text-white rounded-xl">
          {filtered.length} Participants Enrolled
        </span>
      </div>

      {/* Carnival Department Restriction Notice */}
      {isCarnival && (
        <div className="bg-gradient-to-r from-light-blue-50 to-white p-4 rounded-2xl border border-light-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-blue bg-light-blue-100 px-2.5 py-0.5 rounded-full">
              Carnival Department Coordinator Desk
            </span>
            <h4 className="text-xs font-bold text-navy-blue mt-1">
              Department Assigned: <span className="text-primary-blue font-extrabold">{profile?.department || 'Institution-wide'}</span>
            </h4>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing only <strong className="text-navy-blue">{profile?.department}</strong> participants ({filtered.length} enrolled)
          </span>
        </div>
      )}

      {/* Filter and Search */}
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
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No registrations recorded for this event yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-light-blue-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Participant Student</th>
                  <th className="py-4 px-6">ERP & Academics</th>
                  <th className="py-4 px-6">Format</th>
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
                    </td>

                    <td className="py-4 px-6 font-mono">
                      <div className="font-bold text-navy-blue">{p.erp_number}</div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">{p.department} ({p.year})</div>
                    </td>

                    <td className="py-4 px-6">
                      {p.is_team ? (
                        <span className="font-bold text-primary-blue text-[11px]">Team ({p.team_name || 'Group'})</span>
                      ) : (
                        <span className="text-slate-500">Solo Entry</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.status || 'Registered'}
                      </span>
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
          title={`Participant Details: ${inspectTarget.full_name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-cream-50 p-4 rounded-2xl border space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
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
                <span className="text-slate-500">Year & Section:</span>
                <span className="font-semibold text-navy-blue">{inspectTarget.year} - Sec {inspectTarget.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-semibold text-navy-blue">{inspectTarget.mobile}</span>
              </div>
            </div>

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
