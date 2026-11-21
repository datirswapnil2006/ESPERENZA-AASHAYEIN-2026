import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { participantService } from '../../services/participantService';
import { reportService } from '../../services/reportService';
import { COLLEGE_DEPARTMENTS, matchDepartment } from '../../utils/departments';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AdminEventModal from './AdminEventModal';
import { 
  GraduationCap, 
  Users, 
  ClipboardList, 
  FileSpreadsheet, 
  Settings, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Download, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3, 
  FileText,
  FolderOpen,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminEventFolderView() {
  const { slug, eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [festival, setFestival] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active folder tab: 'faculty' | 'students' | 'participants' | 'reports' | 'overview'
  const [activeTab, setActiveTab] = useState('faculty');

  // Modals & search states
  const [participantSearch, setParticipantSearch] = useState('');
  const [inspectParticipant, setInspectParticipant] = useState(null);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [deptFilter, setDeptFilter] = useState('all');

  // Add coordinator modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRole, setAssignRole] = useState('faculty_coordinator');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Replace coordinator modal
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replacementUserId, setReplacementUserId] = useState('');
  const [replaceSubmitting, setReplaceSubmitting] = useState(false);

  // Deactivate confirmation
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  async function loadEventData() {
    setLoading(true);
    try {
      const [allFestivals, allEvents, allAssigns, allParts, allProfiles] = await Promise.all([
        eventService.getFestivals(),
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments(),
        participantService.getAllParticipants(),
        coordinatorService.getAllProfiles()
      ]);

      setFestivals(allFestivals || []);
      const currentEvt = (allEvents || []).find(e => e.id === eventId || e.slug === eventId);
      if (currentEvt) {
        setEvent(currentEvt);
        const currentFest = (allFestivals || []).find(f => f.id === currentEvt.festival_id || f.slug === (slug || currentEvt.festival_slug));
        setFestival(currentFest);

        // Filter assignments for this specific event
        const evtAssigns = (allAssigns || []).filter(a => a.event_id === currentEvt.id);
        setAssignments(evtAssigns);

        // Filter participants for this specific event
        const evtParts = (allParts || []).filter(p => p.event_id === currentEvt.id);
        setParticipants(evtParts);
      }
      setProfiles(allProfiles || []);
    } catch (err) {
      console.error('Error loading event folder view:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEventData();

    const unsubEvents = eventService.subscribeToEvents(() => loadEventData());
    const unsubAssigns = coordinatorService.subscribeToAssignments(() => loadEventData());
    const unsubParts = participantService.subscribeToParticipants(() => loadEventData());

    return () => {
      unsubEvents();
      unsubAssigns();
      unsubParts();
    };
  }, [eventId, slug]);

  // Handler: Assign Coordinator
  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !event) return;
    setAssignSubmitting(true);
    try {
      await coordinatorService.assignCoordinator({
        eventId: event.id,
        userId: selectedUserId,
        role: assignRole,
        assignedBy: 'admin'
      });
      setShowAssignModal(false);
      setSelectedUserId('');
      loadEventData();
    } catch (err) {
      alert('Error assigning coordinator: ' + err.message);
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Handler: Replace Coordinator
  const handleReplaceCoordinator = async (e) => {
    e.preventDefault();
    if (!replaceTarget || !replacementUserId) return;
    setReplaceSubmitting(true);
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
      loadEventData();
    } catch (err) {
      alert('Error replacing coordinator: ' + err.message);
    } finally {
      setReplaceSubmitting(false);
    }
  };

  // Handler: Deactivate Assignment
  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await coordinatorService.removeAssignment(deactivateTarget.id);
      setDeactivateTarget(null);
      loadEventData();
    } catch (err) {
      alert('Error deactivating assignment: ' + err.message);
    } finally {
      setDeactivating(false);
    }
  };

  // Handler: Participant Status Update
  const handleParticipantStatusChange = async (partId, newStatus) => {
    try {
      await participantService.updateParticipantStatus(partId, newStatus);
      loadEventData();
    } catch (err) {
      alert('Error updating participant status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
        <h3 className="text-xl font-bold text-navy-blue">Event Not Found</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6">Unable to locate event record.</p>
        <button
          onClick={() => navigate('/admin/festival/' + (slug || 'aashayein'))}
          className="px-5 py-2.5 bg-primary-blue text-white rounded-xl text-xs font-bold"
        >
          Return to Events List
        </button>
      </div>
    );
  }

  const facultyCoordinators = assignments.filter(a => a.role === 'faculty_coordinator' && a.status === 'active');
  const pastFaculty = assignments.filter(a => a.role === 'faculty_coordinator' && a.status === 'replaced');
  
  const studentCoordinators = assignments.filter(a => ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role) && a.status === 'active');
  const pastStudents = assignments.filter(a => ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role) && a.status === 'replaced');

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.full_name?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                          p.erp_number?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                          p.department?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                          p.team_name?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                          p.email?.toLowerCase().includes(participantSearch.toLowerCase());
    const matchesDept = matchDepartment(p.department, deptFilter);
    return matchesSearch && matchesDept;
  });

  const festivalSlug = event.festival_slug || slug || (festival?.slug || 'aashayein');
  const isTech = festivalSlug === 'esperanza';

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link to="/admin" className="hover:text-primary-blue transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to={`/admin/festival/${festivalSlug}`} className="hover:text-primary-blue transition-colors capitalize">
          {festival?.name || festivalSlug}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-navy-blue font-extrabold truncate">{event.name}</span>
      </div>

      {/* Main Event Folder Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase text-white ${
              isTech ? 'bg-primary-blue' : 'bg-navy-blue'
            }`}>
              {festival?.name || (isTech ? 'Esperenza' : 'Aashayein')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-light-blue-100 text-primary-blue">
              {event.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
              event.status === 'archived' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {event.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-navy-blue leading-tight">
            {event.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-blue shrink-0" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-blue shrink-0" />
              <span>{new Date(event.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-blue shrink-0" />
              <span>Deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setShowEditEventModal(true)}
            className="px-4 py-2.5 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Event</span>
          </button>
          <Link
            to={`/events/${festivalSlug}/${event.slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Public Page</span>
          </Link>
          <button
            onClick={() => reportService.exportEventCompleteReport(event.id, event.name, 'xlsx')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Package</span>
          </button>
        </div>
      </div>

      {/* The 3 Core Event Folders / Tabs requested by User */}
      <div className="space-y-6">
        
        {/* Folder Tabs Switcher Bar */}
        <div className="bg-white p-2 rounded-2xl border border-light-blue-200 shadow-soft grid grid-cols-2 md:grid-cols-4 gap-2">
          
          {/* Tab 1: Faculty Coordinators */}
          <button
            onClick={() => setActiveTab('faculty')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'faculty'
                ? 'bg-navy-blue text-white shadow-soft scale-[1.01]'
                : 'text-slate-600 hover:text-navy-blue hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Faculty Coordinators</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'faculty' ? 'bg-navy-blue-light text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {facultyCoordinators.length}
            </span>
          </button>

          {/* Tab 2: Student Coordinators */}
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'students'
                ? 'bg-primary-blue text-white shadow-soft scale-[1.01]'
                : 'text-slate-600 hover:text-navy-blue hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Coordinators</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'students' ? 'bg-primary-blue-dark text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {studentCoordinators.length}
            </span>
          </button>

          {/* Tab 3: Participants */}
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'participants'
                ? 'bg-purple-600 text-white shadow-soft scale-[1.01]'
                : 'text-slate-600 hover:text-navy-blue hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Event Participants</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'participants' ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {participants.length}
            </span>
          </button>

          {/* Tab 4: Reports & Downloads */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-soft scale-[1.01]'
                : 'text-slate-600 hover:text-navy-blue hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Reports & Downloads</span>
          </button>
        </div>

        {/* FOLDER CONTENT 1: FACULTY COORDINATORS OF THIS EVENT */}
        {activeTab === 'faculty' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-navy-blue flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-blue" />
                  <span>Faculty Coordinators In-Charge ({event.name})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional faculty members authorized to oversee this event, configure registration forms, and supervise student teams.
                </p>
              </div>

              <button
                onClick={() => {
                  setAssignRole('faculty_coordinator');
                  setSelectedUserId('');
                  setShowAssignModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft flex items-center gap-1.5 self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Faculty In-Charge</span>
              </button>
            </div>

            {facultyCoordinators.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-light-blue-200 bg-cream-50/50">
                <GraduationCap className="w-10 h-10 text-primary-blue/60 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-navy-blue">No Faculty Lead Assigned to {event.name}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Assign Faculty In-Charge" to link a verified faculty coordinator to this competition.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultyCoordinators.map(a => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl border border-light-blue-200 bg-light-blue-50/40 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary-blue transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-navy-blue text-white">
                          Lead Faculty In-Charge
                        </span>
                        <span className="text-[11px] font-mono text-primary-blue font-bold">
                          Emp ID: {a.profiles?.employee_id || 'N/A'}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-navy-blue">{a.profiles?.full_name}</h4>
                      <p className="text-xs font-semibold text-primary-blue">{a.profiles?.designation || 'Faculty Coordinator'}</p>
                      <p className="text-xs text-slate-500">{a.profiles?.department}</p>

                      <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                        <div>Email: <strong className="text-navy-blue">{a.profiles?.email}</strong></div>
                        {a.profiles?.mobile && <div>Phone: <strong className="text-navy-blue">{a.profiles?.mobile}</strong></div>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setReplaceTarget(a);
                          setReplacementUserId('');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Replace faculty member while preserving audit history"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Faculty</span>
                      </button>
                      <button
                        onClick={() => setDeactivateTarget(a)}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Deactivate assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Past Replaced Faculty History */}
            {pastFaculty.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Replaced Faculty History (Preserved Audit Records)
                </span>
                <div className="divide-y divide-slate-100 text-xs">
                  {pastFaculty.map(pf => (
                    <div key={pf.id} className="py-2 flex items-center justify-between text-slate-500">
                      <div>
                        <span className="font-bold text-navy-blue">{pf.profiles?.full_name}</span> ({pf.profiles?.department})
                      </div>
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Replaced on {new Date(pf.updated_at || pf.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOLDER CONTENT 2: STUDENT COORDINATORS OF THIS EVENT */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-navy-blue flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>Student Coordinators & Volunteers ({event.name})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appointed student leads, co-coordinators, and volunteer teams managing logistics and operations for this competition.
                </p>
              </div>

              <button
                onClick={() => {
                  setAssignRole('student_coordinator');
                  setSelectedUserId('');
                  setShowAssignModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft flex items-center gap-1.5 self-start sm:self-auto transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Appoint Student Coordinator</span>
              </button>
            </div>

            {studentCoordinators.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-light-blue-200 bg-cream-50/50">
                <Users className="w-10 h-10 text-primary-blue/60 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-navy-blue">No Student Coordinators Appointed Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Appoint Student Coordinator" to assign student leads, co-coordinators, or volunteers to {event.name}.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-6">ERP & Year</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Role In Event</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-navy-text">
                    {studentCoordinators.map(a => (
                      <tr key={a.id} className="hover:bg-light-blue-50/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-navy-blue text-sm">
                          {a.profiles?.full_name}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-navy-blue">
                          {a.profiles?.erp_number || 'N/A'}
                          <span className="block font-sans text-[11px] text-slate-500 font-normal">
                            {a.profiles?.year || 'Student'} - Sec {a.profiles?.section || 'A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {a.profiles?.department}
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
                        <td className="py-4 px-6 text-slate-500">
                          <div>{a.profiles?.email}</div>
                          {a.profiles?.mobile && <div className="text-[11px] text-slate-400">{a.profiles.mobile}</div>}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setReplaceTarget(a);
                              setReplacementUserId('');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-bold inline-flex items-center gap-1"
                            title="Replace student coordinator (history kept)"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Replace</span>
                          </button>
                          <button
                            onClick={() => setDeactivateTarget(a)}
                            className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                            title="Deactivate assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Past Replaced Students History */}
            {pastStudents.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Replaced Student Coordinator History
                </span>
                <div className="divide-y divide-slate-100 text-xs">
                  {pastStudents.map(ps => (
                    <div key={ps.id} className="py-2 flex items-center justify-between text-slate-500">
                      <div>
                        <span className="font-bold text-navy-blue">{ps.profiles?.full_name}</span> ({ps.role.replace('_', ' ')}) - ERP: {ps.profiles?.erp_number}
                      </div>
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Replaced on {new Date(ps.updated_at || ps.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOLDER CONTENT 3: PARTICIPANTS OF THIS EVENT */}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-navy-blue flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  <span>Enrolled Participants ({event.name})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live participant registrations submitted specifically for this competition.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => reportService.exportEventDepartmentWise(event.id, event.name, 'xlsx')}
                  className="px-4 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft flex items-center gap-1.5"
                  title="Export multi-sheet Excel with individual sheets for each department"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Department-Wise Excel</span>
                </button>
                <button
                  onClick={() => reportService.exportParticipants('csv', { eventId: event.id, eventName: event.name, department: deptFilter !== 'all' ? deptFilter : undefined })}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => reportService.exportParticipants('xlsx', { eventId: event.id, eventName: event.name })}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export All Excel</span>
                </button>
              </div>
            </div>

            {/* Department Filter Bar & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="Search student, ERP, team, or department..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Department Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Department:</span>
                <button
                  type="button"
                  onClick={() => setDeptFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    deptFilter === 'all'
                      ? 'bg-navy-blue text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({participants.length})
                </button>
                {[...COLLEGE_DEPARTMENTS, 'Other'].map(deptName => {
                  const count = participants.filter(p => matchDepartment(p.department, deptName)).length;
                  return (
                    <button
                      key={deptName}
                      type="button"
                      onClick={() => setDeptFilter(deptName)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        deptFilter === deptName
                          ? 'bg-primary-blue text-white font-bold shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {deptName} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredParticipants.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-light-blue-200 bg-cream-50/50">
                <ClipboardList className="w-10 h-10 text-purple-500/60 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-navy-blue">No Participants Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No student registrations recorded for {event.name} matching your search.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-6">ERP & Academics</th>
                      <th className="py-4 px-6">Format</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-navy-text">
                    {filteredParticipants.map(p => (
                      <tr key={p.id} className="hover:bg-light-blue-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-navy-blue text-sm">{p.full_name}</div>
                          <div className="text-slate-500">{p.email}</div>
                          <div className="text-[11px] text-slate-400">{p.mobile}</div>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold text-navy-blue">
                          {p.erp_number}
                          <span className="block font-sans text-[11px] text-slate-500 font-normal">
                            {p.department} ({p.year} - {p.section})
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          {p.is_team ? (
                            <span className="font-bold text-primary-blue text-[11px]">
                              Team ({p.team_name || 'Group'})
                            </span>
                          ) : (
                            <span className="text-slate-500">Solo Entry</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <select
                            value={p.status || 'registered'}
                            onChange={(e) => handleParticipantStatusChange(p.id, e.target.value)}
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
                            onClick={() => setInspectParticipant(p)}
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
            )}
          </div>
        )}

        {/* FOLDER CONTENT 4: REPORTS & DOWNLOADS FOR THIS EVENT */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-lg font-black text-navy-blue flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Dedicated Downloads: {event.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download formatted Excel workbooks and raw CSV files specifically for {event.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Card 1: Department-Wise Workbook (Multi-Sheet) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                    Department Partitioned
                  </span>
                  <h4 className="text-sm font-bold text-navy-blue mt-2">Department-Wise Workbook</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Multi-sheet Excel workbook partitioned by academic department (EXTC, Civil, Mech, AIDS, CSE(IOT), MCA, MBA, CSE, IT, Other).
                  </p>
                  <p className="text-[10px] font-mono text-emerald-700 mt-2 truncate">
                    {event.slug}_Department_Wise_Report.xlsx
                  </p>
                </div>
                <button
                  onClick={() => reportService.exportEventDepartmentWise(event.id, event.name, 'xlsx')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Department-Wise XLSX</span>
                </button>
              </div>

              {/* Card 2: Complete Package */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-light-blue-50 to-white border border-light-blue-200 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-primary-blue text-white px-2 py-0.5 rounded">
                    All-in-One Package
                  </span>
                  <h4 className="text-sm font-bold text-navy-blue mt-2">Complete Event Package</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Multi-sheet workbook containing Participants, Faculty Leads, and Student Coordinators.
                  </p>
                  <p className="text-[10px] font-mono text-primary-blue mt-2 truncate">
                    {event.slug}_Complete_Report.xlsx
                  </p>
                </div>
                <button
                  onClick={() => reportService.exportEventCompleteReport(event.id, event.name, 'xlsx')}
                  className="w-full py-2.5 px-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete XLSX</span>
                </button>
              </div>

              {/* Card 3: Participants Only */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    Student Roster
                  </span>
                  <h4 className="text-sm font-bold text-navy-blue mt-2">Event Participants</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Detailed student participant list with ERP numbers, phone, email, and team status.
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-2 truncate">
                    {event.slug}_Participants.xlsx
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => reportService.exportParticipants('xlsx', { eventId: event.id, eventName: event.name })}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold"
                  >
                    XLSX
                  </button>
                  <button
                    onClick={() => reportService.exportParticipants('csv', { eventId: event.id, eventName: event.name })}
                    className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Card 4: Student Coordinators */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-light-blue-100 text-primary-blue px-2 py-0.5 rounded">
                    Student Leads
                  </span>
                  <h4 className="text-sm font-bold text-navy-blue mt-2">Student Coordinators</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Student coordinators, co-coordinators, and volunteer roster for {event.name}.
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-2 truncate">
                    {event.slug}_Student_Coordinators.xlsx
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => reportService.exportStudentCoordinators('xlsx', 'all', { eventId: event.id, eventName: event.name })}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold"
                  >
                    XLSX
                  </button>
                  <button
                    onClick={() => reportService.exportStudentCoordinators('csv', 'all', { eventId: event.id, eventName: event.name })}
                    className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Card 5: Faculty Coordinators */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-navy-blue text-white px-2 py-0.5 rounded">
                    Faculty In-Charge
                  </span>
                  <h4 className="text-sm font-bold text-navy-blue mt-2">Faculty Coordinators</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Official faculty members assigned to supervise {event.name}.
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-2 truncate">
                    {event.slug}_Faculty_Coordinators.xlsx
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => reportService.exportFacultyCoordinators('xlsx', { eventId: event.id, eventName: event.name })}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold"
                  >
                    XLSX
                  </button>
                  <button
                    onClick={() => reportService.exportFacultyCoordinators('csv', { eventId: event.id, eventName: event.name })}
                    className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                  >
                    CSV
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Assign Coordinator Modal */}
      {showAssignModal && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title={`Appoint Coordinator to ${event.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAssignCoordinator} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Coordinator Role Type *</label>
              <select
                value={assignRole}
                onChange={(e) => {
                  setAssignRole(e.target.value);
                  setSelectedUserId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="faculty_coordinator">Faculty Coordinator In-Charge</option>
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
                <option value="">Choose registered candidate</option>
                {profiles
                  .filter(p => assignRole === 'faculty_coordinator' ? p.role === 'faculty_coordinator' : p.role === 'student_coordinator')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.department || p.email}) {p.erp_number ? `- ERP: ${p.erp_number}` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignSubmitting}
                className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft"
              >
                {assignSubmitting ? 'Appointing...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Replace Coordinator Modal */}
      {replaceTarget && (
        <Modal
          isOpen={Boolean(replaceTarget)}
          onClose={() => setReplaceTarget(null)}
          title={`Replace: ${replaceTarget.profiles?.full_name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReplaceCoordinator} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
              Replacing <strong>{replaceTarget.profiles?.full_name}</strong> for <strong>{event.name}</strong>. Their past actions and records will remain archived under assignment history.
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Select Successor Candidate *</label>
              <select
                value={replacementUserId}
                onChange={(e) => setReplacementUserId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
              >
                <option value="">Select successor</option>
                {profiles
                  .filter(p => p.id !== replaceTarget.user_id && (replaceTarget.role === 'faculty_coordinator' ? p.role === 'faculty_coordinator' : p.role === 'student_coordinator'))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.department || p.email})
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
                disabled={replaceSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-soft"
              >
                {replaceSubmitting ? 'Replacing...' : 'Confirm Replacement'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Inspect Participant Modal */}
      {inspectParticipant && (
        <Modal
          isOpen={Boolean(inspectParticipant)}
          onClose={() => setInspectParticipant(null)}
          title={`Participant Details: ${inspectParticipant.full_name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-cream-50 p-4 rounded-2xl border space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-navy-blue">{inspectParticipant.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ERP Number:</span>
                <span className="font-mono font-bold text-navy-blue">{inspectParticipant.erp_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-navy-blue">{inspectParticipant.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class Year & Section:</span>
                <span className="font-semibold text-navy-blue">{inspectParticipant.year} - Sec {inspectParticipant.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-navy-blue">{inspectParticipant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-semibold text-navy-blue">{inspectParticipant.is_team ? `Team (${inspectParticipant.team_name})` : 'Individual'}</span>
              </div>
            </div>

            {inspectParticipant.answers && Object.keys(inspectParticipant.answers).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-navy-blue border-b pb-1">Custom Form Answers</h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border space-y-2">
                  {Object.entries(inspectParticipant.answers).map(([key, val], idx) => (
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
                onClick={() => setInspectParticipant(null)}
                className="px-4 py-2 bg-navy-blue text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && (
        <AdminEventModal
          isOpen={showEditEventModal}
          onClose={() => setShowEditEventModal(false)}
          eventToEdit={event}
          festivals={festivals}
          onSave={() => loadEventData()}
        />
      )}

      {/* Deactivate Confirmation */}
      {deactivateTarget && (
        <ConfirmDialog
          isOpen={Boolean(deactivateTarget)}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleDeactivate}
          title="Deactivate Coordinator Assignment?"
          message={`Are you sure you want to remove ${deactivateTarget.profiles?.full_name} from ${event.name}? Historical assignment records will remain in the database.`}
          confirmText="Deactivate"
          confirmVariant="danger"
          loading={deactivating}
        />
      )}

    </div>
  );
}
