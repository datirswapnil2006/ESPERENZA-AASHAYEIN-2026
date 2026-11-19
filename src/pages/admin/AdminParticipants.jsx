import React, { useState, useEffect } from 'react';
import { participantService } from '../../services/participantService';
import { eventService } from '../../services/eventService';
import { reportService } from '../../services/reportService';
import Modal from '../../components/common/Modal';
import { 
  ClipboardList, 
  Search, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  Users,
  Filter
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [festivalFilter, setFestivalFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  const [inspectTarget, setInspectTarget] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [partList, evtList] = await Promise.all([
        participantService.getAllParticipants(),
        eventService.getAllEvents()
      ]);
      setParticipants(partList || []);
      setEvents(evtList || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const unsub = participantService.subscribeToParticipants(() => loadData());
    return () => unsub();
  }, []);

  const handleStatusChange = async (participantId, newStatus) => {
    try {
      await participantService.updateParticipantStatus(participantId, newStatus);
      loadData();
    } catch (err) {
      alert('Error updating participant status: ' + err.message);
    }
  };

  const filteredEvents = festivalFilter === 'all'
    ? events
    : events.filter(e => e.festival_slug === festivalFilter);

  const filtered = participants.filter((p) => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.erp_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFest = festivalFilter === 'all' || p.festival_slug === festivalFilter;
    const matchesEvent = eventFilter === 'all' || p.event_id === eventFilter;
    return matchesSearch && matchesFest && matchesEvent;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>CENTRAL REGISTRATION REPOSITORY</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">All Festival Participants</h2>
          <p className="text-xs text-slate-500 mt-1">
            Realtime database entries across Esperenza and Aashayein competitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => reportService.exportParticipants('csv', { festivalSlug: festivalFilter !== 'all' ? festivalFilter : undefined })}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => reportService.exportParticipants('xlsx', { festivalSlug: festivalFilter !== 'all' ? festivalFilter : undefined })}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-light-blue-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ERP, email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={festivalFilter}
            onChange={(e) => {
              setFestivalFilter(e.target.value);
              setEventFilter('all');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="all">All Festivals</option>
            <option value="esperanza">Esperenza (Tech)</option>
            <option value="aashayein">Aashayein (Cultural)</option>
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white max-w-[200px] truncate"
          >
            <option value="all">All Events</option>
            {filteredEvents.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No participant records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-light-blue-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Participant Student</th>
                  <th className="py-4 px-6">ERP & Academics</th>
                  <th className="py-4 px-6">Event & Festival</th>
                  <th className="py-4 px-6">Format</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-navy-text">
                {filtered.map((p) => {
                  return (
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
                        <div className="font-bold text-navy-blue">{p.event_name}</div>
                        <span className="text-[10px] font-semibold text-primary-blue uppercase">
                          {p.festival_name}
                        </span>
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
                                : p.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
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
                  );
                })}
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
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-cream-50 p-4 rounded-2xl border border-light-blue-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="font-bold text-navy-blue">{inspectTarget.event_name}</span>
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
                <span className="text-slate-500">Class Year & Sec:</span>
                <span className="font-semibold text-navy-blue">{inspectTarget.year} - Sec {inspectTarget.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-semibold text-navy-blue">{inspectTarget.is_team ? `Team (${inspectTarget.team_name})` : 'Individual'}</span>
              </div>
            </div>

            {inspectTarget.answers && Object.keys(inspectTarget.answers).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-navy-blue border-b pb-1">Custom Form Answers</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                  {Object.entries(inspectTarget.answers).map(([key, val], idx) => (
                    <div key={idx} className="border-b last:border-0 pb-1.5 last:pb-0">
                      <span className="text-[11px] text-slate-400 block">Question {idx + 1}</span>
                      <span className="font-medium text-slate-700">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setInspectTarget(null)}
                className="px-4 py-2 rounded-xl bg-navy-blue text-white font-bold"
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
