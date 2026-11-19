import React, { useState, useEffect } from 'react';
import { coordinatorService } from '../../services/coordinatorService';
import { eventService } from '../../services/eventService';
import Modal from '../../components/common/Modal';
import { 
  UserCheck, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Search, 
  History, 
  Calendar, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // New assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('student_coordinator');

  // Replace modal
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replacementUserId, setReplacementUserId] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [assignList, evtList, profList] = await Promise.all([
        coordinatorService.getAllAssignments(),
        eventService.getAllEvents(),
        coordinatorService.getAllProfiles()
      ]);
      setAssignments(assignList || []);
      setEvents(evtList || []);
      setProfiles(profList || []);

      if (evtList && evtList.length > 0 && !selectedEventId) {
        setSelectedEventId(evtList[0].id);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const unsub = coordinatorService.subscribeToAssignments(() => loadData());
    return () => unsub();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !selectedUserId) return;
    try {
      await coordinatorService.assignCoordinator({
        eventId: selectedEventId,
        userId: selectedUserId,
        role: selectedRole,
        assignedBy: 'admin'
      });
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      alert('Error assigning coordinator: ' + err.message);
    }
  };

  const handleReplaceAssignment = async (e) => {
    e.preventDefault();
    if (!replaceTarget || !replacementUserId) return;
    try {
      await coordinatorService.replaceCoordinator({
        previousAssignmentId: replaceTarget.id,
        eventId: replaceTarget.event_id,
        userId: replacementUserId,
        role: replaceTarget.role,
        assignedBy: 'admin'
      });
      setReplaceTarget(null);
      setReplacementUserId('');
      loadData();
    } catch (err) {
      alert('Error replacing coordinator: ' + err.message);
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm('Deactivate this coordinator assignment? Historical audit records will be kept.')) return;
    try {
      await coordinatorService.removeAssignment(assignmentId);
      loadData();
    } catch (err) {
      alert('Error removing assignment: ' + err.message);
    }
  };

  const filtered = assignments.filter((a) => {
    const event = events.find(e => e.id === a.event_id);
    const user = a.profiles;
    const matchesSearch = user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>ROLE DELEGATION & APPOINTMENTS</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Coordinator Event Assignments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign, replace, and audit faculty leads, student coordinators, and volunteer leads. All replacements preserve audit trail history.
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Coordinator Assignment</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-light-blue-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by coordinator name or event..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['all', 'faculty_coordinator', 'student_coordinator', 'co_coordinator', 'volunteer'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                roleFilter === r ? 'bg-primary-blue text-white shadow-soft' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No assignments found matching criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-light-blue-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Assigned Coordinator</th>
                  <th className="py-4 px-6">Assigned Event & Festival</th>
                  <th className="py-4 px-6">Delegated Role</th>
                  <th className="py-4 px-6">Status & History</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-navy-text">
                {filtered.map((a) => {
                  const ev = events.find(e => e.id === a.event_id);
                  const isReplaced = a.status === 'replaced';
                  const isActive = a.status === 'active';

                  return (
                    <tr key={a.id} className={`hover:bg-light-blue-50/40 transition-colors ${isReplaced ? 'bg-slate-50/70 opacity-75' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="font-bold text-navy-blue text-sm">{a.profiles?.full_name || 'Coordinator'}</div>
                        <div className="text-slate-500">{a.profiles?.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {a.profiles?.employee_id ? `Emp: ${a.profiles.employee_id}` : `ERP: ${a.profiles?.erp_number || 'N/A'}`}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-navy-blue">{ev?.name || 'Festival Event'}</div>
                        <span className="text-[10px] font-semibold text-primary-blue uppercase tracking-wider">
                          {ev?.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          a.role === 'faculty_coordinator'
                            ? 'bg-navy-blue text-white'
                            : a.role === 'student_coordinator'
                              ? 'bg-primary-blue text-white'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Duty</span>
                          </span>
                        )}
                        {isReplaced && (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Replaced (Historical)</span>
                          </span>
                        )}
                        {a.status === 'inactive' && (
                          <span className="text-slate-400 font-semibold text-[11px]">Inactive</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5">
                        {isActive && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setReplaceTarget(a);
                                setReplacementUserId('');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-semibold inline-flex items-center gap-1"
                              title="Replace Coordinator while preserving history"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Replace</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(a.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                              title="Deactivate assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      {showAssignModal && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Create New Coordinator Assignment"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Target Competition / Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.festival_slug})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Assignment Role *</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="faculty_coordinator">Faculty Coordinator</option>
                <option value="student_coordinator">Main Student Coordinator</option>
                <option value="co_coordinator">Co-Coordinator</option>
                <option value="volunteer">Volunteer Lead</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Select Candidate *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="">Choose registered user</option>
                {profiles
                  .filter(p => selectedRole === 'faculty_coordinator' ? p.role === 'faculty_coordinator' : p.role === 'student_coordinator')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.department || p.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft"
              >
                Assign Coordinator
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Replace Coordinator Modal */}
      {replaceTarget && (
        <Modal
          isOpen={Boolean(replaceTarget)}
          onClose={() => setReplaceTarget(null)}
          title={`Replace Coordinator for ${events.find(e => e.id === replaceTarget.event_id)?.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleReplaceAssignment} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
              Replacing <strong>{replaceTarget.profiles?.full_name}</strong>. Their past actions and records will remain archived under assignment history.
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Select Replacement *</label>
              <select
                value={replacementUserId}
                onChange={(e) => setReplacementUserId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="">Select replacement</option>
                {profiles
                  .filter(p => p.id !== replaceTarget.user_id && (replaceTarget.role === 'faculty_coordinator' ? p.role === 'faculty_coordinator' : p.role === 'student_coordinator'))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.department || p.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplaceTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-soft"
              >
                Confirm Replacement
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
