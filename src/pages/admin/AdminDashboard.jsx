import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { participantService } from '../../services/participantService';
import { formService } from '../../services/formService';
import { auditService } from '../../services/auditService';
import StatCard from '../../components/common/StatCard';
import AdminEventModal from './AdminEventModal';
import { 
  Calendar, 
  Users, 
  GraduationCap, 
  ClipboardList, 
  FileSpreadsheet, 
  ShieldAlert, 
  Plus, 
  ArrowRight, 
  Cpu, 
  Music,
  CheckCircle,
  Clock,
  Sparkles,
  Flame,
  Layers
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [festivals, setFestivals] = useState([]);
  const [events, setEvents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [fests, evts, profs, parts, logs] = await Promise.all([
        eventService.getFestivals(),
        eventService.getAllEvents(),
        coordinatorService.getAllProfiles(),
        participantService.getAllParticipants(),
        auditService.getAuditLogs()
      ]);

      setFestivals(fests || []);
      setEvents(evts || []);
      setFaculty((profs || []).filter(p => p.role === 'faculty_coordinator'));
      setStudents((profs || []).filter(p => p.role === 'student_coordinator'));
      setParticipants(parts || []);
      setAuditLogs((logs || []).slice(0, 5));
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();

    // Subscribe to realtime updates for events and participants
    const unsubEvents = eventService.subscribeToEvents(() => loadDashboardData());
    const unsubParticipants = participantService.subscribeToParticipants(() => loadDashboardData());
    const unsubAssignments = coordinatorService.subscribeToAssignments(() => loadDashboardData());

    return () => {
      unsubEvents();
      unsubParticipants();
      unsubAssignments();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  const pendingFaculty = faculty.filter(f => !f.is_verified);
  const activeEvents = events.filter(e => e.status !== 'archived');
  const esperanzaEvents = events.filter(e => 
    e.festival_slug?.toLowerCase().startsWith('esper') || 
    e.festival_id === '11111111-1111-1111-1111-111111111111'
  );
  const aashayeinEvents = events.filter(e => 
    e.festival_slug?.toLowerCase().startsWith('aash') || 
    e.festival_id === '22222222-2222-2222-2222-222222222222'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner & Quick Event Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Management Console</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Festival Operations Overview</h2>
          <p className="text-xs text-slate-500 mt-1">
            Realtime database telemetry for Esperenza & Aashayein 2026–2027.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download Master Excel</span>
          </Link>
          <button
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dynamic Event</span>
          </button>
        </div>
      </div>

      {/* 7 Core System Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Festivals"
          value={festivals.length}
          subtitle="Esperenza & Aashayein"
          icon={Layers}
          color="navy"
        />
        <StatCard
          title="Total Events"
          value={activeEvents.length}
          subtitle={`${esperanzaEvents.length} Tech / ${aashayeinEvents.length} Cultural`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Faculty Coordinators"
          value={faculty.length}
          subtitle={`${pendingFaculty.length} pending verification`}
          icon={GraduationCap}
          color={pendingFaculty.length > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Student Coordinators"
          value={students.length}
          subtitle="Department Representatives"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Participants"
          value={participants.length}
          subtitle="Live registered students"
          icon={ClipboardList}
          color="purple"
        />
        <StatCard
          title="Pending Faculty"
          value={pendingFaculty.length}
          subtitle="Awaiting admin approval"
          icon={ShieldAlert}
          color={pendingFaculty.length > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Esperenza Registrations"
          value={participants.filter(p => p.festival_slug === 'esperanza').length}
          subtitle="Technical events"
          icon={Cpu}
          color="blue"
        />
        <StatCard
          title="Aashayein Registrations"
          value={participants.filter(p => p.festival_slug === 'aashayein').length}
          subtitle="Cultural competitions"
          icon={Music}
          color="purple"
        />
      </div>

      {/* Two Primary Festival Cards (Section 5 Requirement) */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-navy-blue tracking-tight">
          Primary Festival Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Esperenza Card */}
          <div className="bg-white rounded-3xl p-7 border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-light-blue-100 text-primary-blue flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-primary-blue text-white">
                  Technical Track
                </span>
              </div>

              <h4 className="text-2xl font-black text-navy-blue">Esperenza 2026–2027</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inter-collegiate technical festival comprising Robotics competitions, Young Scientist prototypes, Hackathons, and Circuit challenges.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Events</span>
                  <span className="text-lg font-black text-navy-blue">{esperanzaEvents.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Participants</span>
                  <span className="text-lg font-black text-primary-blue">
                    {participants.filter(p => p.festival_slug === 'esperanza').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/admin/festival/esperanza"
                className="w-full py-2.5 px-4 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <span>Manage Esperenza Events & Teams</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Aashayein Card */}
          <div className="bg-white rounded-3xl p-7 border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-navy-blue/10 text-navy-blue flex items-center justify-center font-bold">
                  <Flame className="w-6 h-6 text-navy-blue" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-navy-blue text-white">
                  Cultural Track
                </span>
              </div>

              <h4 className="text-2xl font-black text-navy-blue">Aashayein 2026–2027</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vibrant cultural festival celebrating Dance, Solo & Group Singing, Anchoring & RJ hunts, Street play (Nukkad Natak), and theatrical arts.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Events</span>
                  <span className="text-lg font-black text-navy-blue">{aashayeinEvents.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Participants</span>
                  <span className="text-lg font-black text-navy-blue">
                    {participants.filter(p => p.festival_slug === 'aashayein').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/admin/festival/aashayein"
                className="w-full py-2.5 px-4 rounded-xl bg-navy-blue hover:bg-navy-blue-light text-white text-xs font-bold shadow-soft transition-all flex items-center justify-center gap-2"
              >
                <span>Manage Aashayein Events & Teams</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Faculty Verifications Alert if any */}
      {pendingFaculty.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy-blue">
                {pendingFaculty.length} Faculty Coordinator(s) Awaiting Verification
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                New faculty accounts cannot build forms or modify teams until approved by an administrator.
              </p>
            </div>
          </div>
          <Link
            to="/admin/faculty"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
          >
            Review & Verify Faculty
          </Link>
        </div>
      )}

      {/* Recent System Audit History */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-light-blue-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-navy-blue">Recent Activity & Audit Trail</h3>
          <Link to="/admin/audit" className="text-xs text-primary-blue font-bold hover:underline">
            View All Logs
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-navy-blue">{log.user_name}</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="font-semibold text-primary-blue">{log.action}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{log.details || log.record_id}</p>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <AdminEventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          festivals={festivals}
          onSave={() => loadDashboardData()}
        />
      )}

    </div>
  );
}
