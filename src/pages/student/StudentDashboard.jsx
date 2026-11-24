import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { participantService } from '../../services/participantService';
import { announcementService } from '../../services/announcementService';
import { matchDepartment } from '../../utils/departments';
import StatCard from '../../components/common/StatCard';
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  Bell, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [facultyCoordinators, setFacultyCoordinators] = useState([]);
  const [coCoordinators, setCoCoordinators] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStudentData() {
    setLoading(true);
    try {
      let [allEvents, allAssigns, allParts, allAnns] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments(),
        participantService.getAllParticipants(),
        announcementService.getAnnouncements('coordinators')
      ]);

      // Filter events assigned to current student
      let myAssignments = (allAssigns || []).filter(
        a => a.user_id === profile?.id && a.status === 'active'
      );
      let myEventIds = myAssignments.map(a => a.event_id);

      // Auto-assign / repair if student coordinator has no assigned event yet
      if (myEventIds.length === 0 && allEvents && allEvents.length > 0 && profile?.id) {
        const targetEvent = (profile?.event_id && allEvents.find(e => e.id === profile.event_id)) || allEvents[0];
        if (targetEvent) {
          await coordinatorService.ensureCoordinatorAssignment(profile.id, 'student_coordinator', targetEvent.id);
          myEventIds = [targetEvent.id];
          const freshAssigns = await coordinatorService.getAllAssignments();
          if (freshAssigns) {
            allAssigns = freshAssigns;
          }
        }
      }

      const myEvents = (allEvents || []).filter(e => myEventIds.includes(e.id));
      setAssignedEvents(myEvents);

      // Assigned faculty for these events
      const eventFaculty = (allAssigns || []).filter(
        a => myEventIds.includes(a.event_id) && a.role === 'faculty_coordinator' && a.status === 'active'
      );
      setFacultyCoordinators(eventFaculty);

      // Fellow co-coordinators
      const fellows = (allAssigns || []).filter(
        a => myEventIds.includes(a.event_id) && a.user_id !== profile?.id && ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role) && a.status === 'active'
      );
      setCoCoordinators(fellows);

      // Event participants
      const myParts = (allParts || []).filter(p => {
        const matchesEvent = myEventIds.includes(p.event_id);
        if (!matchesEvent) return false;
        const evt = myEvents.find(e => e.id === p.event_id);
        const isCarnival = evt?.slug === 'carnival' || evt?.name?.toLowerCase().includes('carnival');
        if (isCarnival && profile?.department) {
          return matchDepartment(p.department, profile.department);
        }
        return true;
      });
      setParticipants(myParts);

      setAnnouncements(allAnns || []);
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudentData();
  }, [profile]);

  if (loading) return <LoadingSkeleton lines={6} />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STUDENT COORDINATOR DESK</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Welcome back, {profile?.full_name}!</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ERP: {profile?.erp_number || 'N/A'} • {profile?.department} ({profile?.year || 'Student'}) • Section {profile?.section || 'A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/participants"
            className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all"
          >
            View Participant Roster ({participants.length})
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Competitions"
          value={assignedEvents.length}
          subtitle="Events under your supervision"
          icon={Calendar}
          color="navy"
        />
        <StatCard
          title="Registered Participants"
          value={participants.length}
          subtitle="Students enrolled"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Lead Faculty In-Charge"
          value={facultyCoordinators.length}
          subtitle="Faculty guidance"
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="Co-Coordinators"
          value={coCoordinators.length}
          subtitle="Fellow student coordinators"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Assigned Events Showcase */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-navy-blue tracking-tight">
          My Active Competition Assignments
        </h3>

        {assignedEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-light-blue-200">
            <p className="text-slate-500 font-medium">You have not been assigned to a competition yet.</p>
            <p className="text-xs text-slate-400 mt-1">Your faculty coordinator or festival administrator will assign your duties shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedEvents.map((evt) => {
              const myFaculty = facultyCoordinators.filter(f => f.event_id === evt.id);
              const myCoCoords = coCoordinators.filter(c => c.event_id === evt.id);
              const evtParts = participants.filter(p => p.event_id === evt.id);

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl p-6 border border-light-blue-200 shadow-soft space-y-5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-navy-blue text-white">
                        {evt.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'}
                      </span>
                      <span className="text-xs font-semibold text-primary-blue bg-light-blue-50 px-2 py-0.5 rounded-full">
                        {evt.category}
                      </span>
                    </div>

                    <h4 className="text-xl font-black text-navy-blue">{evt.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-blue" />
                      <span>{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-blue" />
                      <span>Date: {new Date(evt.event_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Faculty & Co-Coordinator Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-cream-50 border border-light-blue-200/60 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Faculty In-Charge:</span>
                      <span className="font-bold text-navy-blue">
                        {myFaculty.map(f => f.profiles?.full_name).join(', ') || 'Faculty pending'}
                      </span>
                      {myFaculty[0]?.profiles?.email && (
                        <span className="block text-[11px] text-slate-500">{myFaculty[0].profiles.email}</span>
                      )}
                    </div>

                    <div className="border-t pt-1.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Co-Coordinators:</span>
                      <span className="font-medium text-slate-700">
                        {myCoCoords.map(c => c.profiles?.full_name).join(', ') || 'Solo assigned'}
                      </span>
                    </div>

                    <div className="border-t pt-1.5 flex justify-between">
                      <span className="text-slate-500">Enrolled Participants:</span>
                      <span className="font-extrabold text-primary-blue">{evtParts.length} Students</span>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-3 gap-2">
                    <Link
                      to="/student/forms"
                      className="text-center py-2 px-2.5 rounded-xl bg-light-blue-100 hover:bg-light-blue-200 text-primary-blue text-xs font-bold transition-all truncate"
                    >
                      Manage Form
                    </Link>
                    <Link
                      to="/student/coordinators"
                      className="text-center py-2 px-2.5 rounded-xl bg-light-blue-100 hover:bg-light-blue-200 text-primary-blue text-xs font-bold transition-all truncate"
                    >
                      + Co-Coordinators
                    </Link>
                    <Link
                      to="/student/participants"
                      className="text-center py-2 px-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all truncate"
                    >
                      Participants
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Announcements Broadcast */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-light-blue-200 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-navy-blue flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-blue" />
          <span>Coordinator Announcements</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {announcements.map((ann) => (
            <div key={ann.id} className="py-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-blue">{ann.title}</span>
                <span className="text-[10px] text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
