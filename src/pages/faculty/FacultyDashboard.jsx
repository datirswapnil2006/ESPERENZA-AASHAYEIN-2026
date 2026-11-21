import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { participantService } from '../../services/participantService';
import { formService } from '../../services/formService';
import { reportService } from '../../services/reportService';
import StatCard from '../../components/common/StatCard';
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  FileEdit, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Download, 
  Sparkles 
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function FacultyDashboard() {
  const { profile, isVerifiedFaculty } = useAuth();
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFacultyData() {
    setLoading(true);
    try {
      const [allEvents, allAssigns, allParts] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments(),
        participantService.getAllParticipants()
      ]);

      // Filter events assigned to current faculty
      let myAssignments = (allAssigns || []).filter(
        a => (a.user_id === profile?.id || a.profiles?.email === profile?.email) && a.status === 'active'
      );
      let myEventIds = myAssignments.map(a => a.event_id);

      // If no assignment yet, auto-repair to target event (e.g. Carnival or profile.event_id)
      if (myEventIds.length === 0 && allEvents && allEvents.length > 0 && profile?.id) {
        const targetEvent = (profile?.event_id && allEvents.find(e => e.id === profile.event_id))
          || allEvents.find(e => e.slug === 'carnival')
          || allEvents[0];
        if (targetEvent) {
          await coordinatorService.ensureCoordinatorAssignment(profile.id, 'faculty_coordinator', targetEvent.id);
          myEventIds = [targetEvent.id];
        }
      }

      let myEvents = (allEvents || []).filter(e => myEventIds.includes(e.id));
      if (myEvents.length === 0 && allEvents && allEvents.length > 0) {
        myEvents = allEvents;
      }
      const myEventParticipants = (allParts || []).filter(p => myEvents.some(e => e.id === p.event_id));

      setAssignedEvents(myEvents);
      setAllAssignments(allAssigns || []);
      setParticipants(myEventParticipants);
    } catch (err) {
      console.error('Error loading faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacultyData();
  }, [profile]);

  if (loading) {
    return <LoadingSkeleton lines={6} />;
  }

  // Count active student coordinators for my events
  const myEventIds = assignedEvents.map(e => e.id);
  const myStudentCoordinators = allAssignments.filter(
    a => myEventIds.includes(a.event_id) && ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role) && a.status === 'active'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FACULTY IN-CHARGE PORTAL</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Welcome, {profile?.full_name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {profile?.designation || 'Faculty Coordinator'} • {profile?.department} • Employee ID: {profile?.employee_id || 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {assignedEvents.length > 0 && (
            <button
              onClick={() => reportService.exportEventCompleteReport(assignedEvents[0].id, assignedEvents[0].name, 'xlsx')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export {assignedEvents[0].name} Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Assigned Competitions"
          value={assignedEvents.length}
          subtitle="Events under your lead"
          icon={Calendar}
          color="navy"
        />
        <StatCard
          title="Student Coordinators"
          value={myStudentCoordinators.filter(a => a.role === 'student_coordinator').length}
          subtitle="Main student leads"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Co-Coordinators & Volunteers"
          value={myStudentCoordinators.filter(a => ['co_coordinator', 'volunteer'].includes(a.role)).length}
          subtitle="Supporting crew"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Total Registrations"
          value={participants.length}
          subtitle="Registered participants"
          icon={ClipboardList}
          color="purple"
        />
      </div>

      {/* Assigned Event Cards (Section 8 Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-navy-blue tracking-tight">
            Assigned Event Command Centers
          </h3>
          <Link to="/faculty/events" className="text-xs text-primary-blue font-bold hover:underline">
            Manage All
          </Link>
        </div>

        {assignedEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-light-blue-200">
            <p className="text-slate-500 font-medium">You currently do not have any assigned competitions.</p>
            <p className="text-xs text-slate-400 mt-1">Please contact a Super Admin to link your faculty account to a competition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedEvents.map((evt) => {
              const evtStudentCoords = allAssignments.filter(a => a.event_id === evt.id && a.role === 'student_coordinator' && a.status === 'active');
              const evtCoCoords = allAssignments.filter(a => a.event_id === evt.id && ['co_coordinator', 'volunteer'].includes(a.role) && a.status === 'active');
              const evtParticipants = participants.filter(p => p.event_id === evt.id);

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl p-6 border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-navy-blue text-white">
                        {evt.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {evt.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-xl font-black text-navy-blue">{evt.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-blue" />
                        <span>{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary-blue" />
                        <span>Date: {new Date(evt.event_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Coordinators Summary */}
                    <div className="p-3 bg-cream-50 rounded-2xl border border-light-blue-200/60 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Leads:</span>
                        <span className="font-bold text-navy-blue">
                          {evtStudentCoords.map(a => a.profiles?.full_name).join(', ') || 'None assigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Co-Coordinators:</span>
                        <span className="font-bold text-navy-blue">
                          {evtCoCoords.map(a => a.profiles?.full_name).join(', ') || 'None assigned'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1.5">
                        <span className="text-slate-500">Total Participants:</span>
                        <span className="font-extrabold text-primary-blue">{evtParticipants.length} students</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link
                      to="/faculty/forms"
                      className="py-2.5 px-3 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Form Builder</span>
                    </Link>
                    <Link
                      to="/faculty/students"
                      className="py-2.5 px-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-soft"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manage Team</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
