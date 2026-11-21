import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coordinatorService } from '../../services/coordinatorService';
import { eventService } from '../../services/eventService';
import Modal from '../../components/common/Modal';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Mail, 
  Phone, 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function FacultyCoordinators({ defaultRoleFilter = 'all' }) {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  // Add coordinator modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('existing'); // 'existing' or 'invite'
  const [candidateUserId, setCandidateUserId] = useState('');
  const [targetEventId, setTargetEventId] = useState('');
  const [assignmentRole, setAssignmentRole] = useState(
    defaultRoleFilter === 'co_coordinator' ? 'co_coordinator' : 'student_coordinator'
  );

  // Direct invite fields if student has no account yet
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMobile, setInviteMobile] = useState('');
  const [inviteErp, setInviteErp] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [inviteYear, setInviteYear] = useState('3rd Year');
  const [inviteSec, setInviteSec] = useState('A');

  // Replace modal
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replacementUserId, setReplacementUserId] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [allEvents, allAssigns, allProfiles] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments(),
        coordinatorService.getAllProfiles()
      ]);

      // My assigned events
      let myEventIds = (allAssigns || [])
        .filter(a => (a.user_id === profile?.id || a.profiles?.email === profile?.email) && a.status === 'active')
        .map(a => a.event_id);

      if (myEventIds.length === 0 && allEvents && allEvents.length > 0 && profile?.id) {
        const targetEvent = (profile?.event_id && allEvents.find(e => e.id === profile.event_id)) || allEvents[0];
        if (targetEvent) {
          const role = profile?.role === 'student_coordinator' ? 'student_coordinator' : 'faculty_coordinator';
          await coordinatorService.ensureCoordinatorAssignment(profile.id, role, targetEvent.id);
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
        setTargetEventId(myEvents[0].id);
      }

      setAssignments((allAssigns || []).filter(a => myEvents.some(me => me.id === a.event_id)));
      setStudents((allProfiles || []).filter(p => p.role === 'student_coordinator' || p.role === 'faculty_coordinator'));
    } catch (err) {
      console.error('Error fetching faculty coordinators data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleAddCoordinator = async (e) => {
    e.preventDefault();

    try {
      let finalUserId = candidateUserId;

      // If inviting a person without an account, create profile first
      if (addMode === 'invite') {
        const newPerson = {
          id: `coord-${Date.now()}`,
          email: inviteEmail || `coord-${Date.now()}@festival.edu`,
          full_name: inviteName,
          role: assignmentRole.includes('faculty') ? 'faculty_coordinator' : 'student_coordinator',
          mobile: inviteMobile,
          erp_number: inviteErp || null,
          department: inviteDept || profile?.department || 'General',
          year: inviteYear,
          section: inviteSec,
          is_verified: true,
          created_at: new Date().toISOString()
        };
        finalUserId = newPerson.id;
      }

      await coordinatorService.assignCoordinator({
        eventId: targetEventId || selectedEventId,
        userId: finalUserId,
        role: assignmentRole,
        assignedBy: profile.id
      });

      setShowAddModal(false);
      resetInviteForm();
      loadData();
    } catch (err) {
      alert('Error adding coordinator: ' + err.message);
    }
  };

  const resetInviteForm = () => {
    setInviteName('');
    setInviteEmail('');
    setInviteMobile('');
    setInviteErp('');
    setCandidateUserId('');
  };

  const handleReplace = async (e) => {
    e.preventDefault();
    if (!replaceTarget || !replacementUserId) return;

    try {
      await coordinatorService.replaceCoordinator({
        previousAssignmentId: replaceTarget.id,
        eventId: replaceTarget.event_id,
        userId: replacementUserId,
        role: replaceTarget.role,
        assignedBy: profile.id
      });
      setReplaceTarget(null);
      setReplacementUserId('');
      loadData();
    } catch (err) {
      alert('Error replacing coordinator: ' + err.message);
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm('Deactivate this coordinator assignment? History is preserved.')) return;
    try {
      await coordinatorService.removeAssignment(assignmentId);
      loadData();
    } catch (err) {
      alert('Error removing coordinator: ' + err.message);
    }
  };

  const filtered = assignments.filter((a) => {
    const isStudentRole = ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role);
    const matchesEvent = !selectedEventId || a.event_id === selectedEventId;
    const matchesSearch = a.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.profiles?.erp_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return isStudentRole && matchesEvent && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>EVENT COORDINATION COUNCIL</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Student Coordinator & Team Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign main student coordinators, co-coordinators, and volunteers. Replacing someone preserves historical records.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isVerifiedFaculty) {
              alert('Account pending admin verification. You will be able to appoint coordinators once verified.');
              return;
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Student Coordinator</span>
        </button>
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
            <span className="text-xs font-bold text-slate-500">Filter Event:</span>
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
          <p className="text-slate-500 font-medium">No student coordinators assigned yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Assign Student Coordinator" to appoint team members.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-light-blue-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Student Coordinator</th>
                  <th className="py-4 px-6">ERP & Department</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Status & History</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-navy-text">
                {filtered.map((a) => {
                  const isReplaced = a.status === 'replaced';
                  const isActive = a.status === 'active';

                  return (
                    <tr key={a.id} className={`hover:bg-light-blue-50/40 transition-colors ${isReplaced ? 'bg-slate-50 opacity-70' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="font-bold text-navy-blue text-sm">{a.profiles?.full_name}</div>
                        <div className="text-slate-500">{a.profiles?.email}</div>
                        {a.profiles?.mobile && <div className="text-[11px] text-slate-400">{a.profiles.mobile}</div>}
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <div className="font-bold text-navy-blue">{a.profiles?.erp_number || 'N/A'}</div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                          {a.profiles?.department} ({a.profiles?.year || 'Student'})
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          a.role === 'student_coordinator'
                            ? 'bg-primary-blue text-white'
                            : a.role === 'co_coordinator'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
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
                            <span>Replaced (Historical Record)</span>
                          </span>
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
                              title="Replace coordinator while archiving record"
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

      {/* Add / Invite Coordinator Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Appoint Student Coordinator / Volunteer"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddCoordinator} className="space-y-4 text-xs">
            {events.length > 1 && (
              <div>
                <label className="block font-bold text-navy-blue mb-1">Target Competition *</label>
                <select
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
                >
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-navy-blue mb-1">Delegated Role *</label>
              <select
                value={assignmentRole}
                onChange={(e) => setAssignmentRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="student_coordinator">Student Coordinator</option>
                <option value="co_coordinator">Student Co-Coordinator</option>
                <option value="faculty_co_coordinator">Faculty Co-Coordinator</option>
                <option value="volunteer">Volunteer Lead</option>
              </select>
            </div>

            {/* Switch between Existing Registered Student vs Invite Unregistered Student */}
            <div className="flex border-b border-slate-200 gap-4 pt-1">
              <button
                type="button"
                onClick={() => setAddMode('existing')}
                className={`pb-2 font-bold text-xs ${addMode === 'existing' ? 'border-b-2 border-primary-blue text-primary-blue' : 'text-slate-500'}`}
              >
                Choose Existing Registered Student
              </button>
              <button
                type="button"
                onClick={() => setAddMode('invite')}
                className={`pb-2 font-bold text-xs ${addMode === 'invite' ? 'border-b-2 border-primary-blue text-primary-blue' : 'text-slate-500'}`}
              >
                Invite New Student (No Account)
              </button>
            </div>

            {addMode === 'existing' ? (
              <div>
                <label className="block font-bold text-navy-blue mb-1">Select Registered Student *</label>
                <select
                  value={candidateUserId}
                  onChange={(e) => setCandidateUserId(e.target.value)}
                  required={addMode === 'existing'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
                >
                  <option value="">Choose student from portal</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.erp_number || s.email}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-navy-blue mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required={addMode === 'invite'}
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Varun Kapoor"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-navy-blue mb-1">ERP Number *</label>
                    <input
                      type="text"
                      required={addMode === 'invite'}
                      value={inviteErp}
                      onChange={(e) => setInviteErp(e.target.value)}
                      placeholder="e.g. 2024CS0190"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy-blue mb-1">Department</label>
                    <input
                      type="text"
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-navy-blue mb-1">College Email *</label>
                    <input
                      type="email"
                      required={addMode === 'invite'}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="varun@college.edu"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy-blue mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={inviteMobile}
                      onChange={(e) => setInviteMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Replace Modal */}
      {replaceTarget && (
        <Modal
          isOpen={Boolean(replaceTarget)}
          onClose={() => setReplaceTarget(null)}
          title={`Replace Coordinator: ${replaceTarget.profiles?.full_name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleReplace} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
              Replacing <strong>{replaceTarget.profiles?.full_name}</strong>. Their past records and audits will remain safely preserved in the database.
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Select Successor Coordinator *</label>
              <select
                value={replacementUserId}
                onChange={(e) => setReplacementUserId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="">Select registered student</option>
                {students
                  .filter(s => s.id !== replaceTarget.user_id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.erp_number}) - {s.department}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
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
