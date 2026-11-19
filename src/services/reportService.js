import { eventService } from './eventService';
import { coordinatorService } from './coordinatorService';
import { participantService } from './participantService';
import { exportToCSV, exportToXLSX, exportConsolidatedWorkbook } from '../utils/exportHelpers';

export const reportService = {
  async getExportData() {
    const [festivals, events, assignments, participants, profiles] = await Promise.all([
      eventService.getFestivals(),
      eventService.getAllEvents(),
      coordinatorService.getAllAssignments(),
      participantService.getAllParticipants(),
      coordinatorService.getAllProfiles()
    ]);

    return { festivals, events, assignments, participants, profiles };
  },

  // Export Faculty Coordinators List
  async exportFacultyCoordinators(format = 'xlsx') {
    const { assignments, events } = await this.getExportData();
    const facultyAssignments = assignments.filter(a => a.role === 'faculty_coordinator' && a.status === 'active');

    const data = facultyAssignments.map((a, idx) => {
      const event = events.find(e => e.id === a.event_id);
      return {
        'S.No': idx + 1,
        'Faculty Name': a.profiles?.full_name || 'N/A',
        'Employee ID': a.profiles?.employee_id || 'N/A',
        'Designation': a.profiles?.designation || 'N/A',
        'Department': a.profiles?.department || 'N/A',
        'Email': a.profiles?.email || 'N/A',
        'Mobile': a.profiles?.mobile || 'N/A',
        'Assigned Event': event?.name || 'N/A',
        'Festival': event?.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein',
        'Assigned Date': a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A',
      };
    });

    const filename = 'Faculty_Coordinators_List';
    if (format === 'csv') exportToCSV(data, filename);
    else exportToXLSX(data, filename, 'Faculty Coordinators');
  },

  // Export Student Coordinators List
  async exportStudentCoordinators(format = 'xlsx', roleFilter = 'student_coordinator') {
    const { assignments, events } = await this.getExportData();
    const filtered = assignments.filter(a => 
      (roleFilter === 'all' ? ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role) : a.role === roleFilter) &&
      a.status === 'active'
    );

    const data = filtered.map((a, idx) => {
      const event = events.find(e => e.id === a.event_id);
      return {
        'S.No': idx + 1,
        'Student Name': a.profiles?.full_name || 'N/A',
        'ERP Number': a.profiles?.erp_number || 'N/A',
        'Department': a.profiles?.department || 'N/A',
        'Year': a.profiles?.year || 'N/A',
        'Section': a.profiles?.section || 'N/A',
        'Role': a.role === 'student_coordinator' ? 'Main Student Coordinator' : a.role === 'co_coordinator' ? 'Co-Coordinator' : 'Volunteer',
        'Email': a.profiles?.email || 'N/A',
        'Mobile': a.profiles?.mobile || 'N/A',
        'Assigned Event': event?.name || 'N/A',
        'Festival': event?.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein',
        'Assigned Date': a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A',
      };
    });

    const filename = roleFilter === 'co_coordinator' ? 'Co_Coordinators_List' : 'Student_Coordinators_List';
    if (format === 'csv') exportToCSV(data, filename);
    else exportToXLSX(data, filename, 'Student Coordinators');
  },

  // Export Participants List (All or filtered by event/festival)
  async exportParticipants(format = 'xlsx', filterOptions = {}) {
    const { participants, events } = await this.getExportData();
    let filtered = [...participants];

    if (filterOptions.eventId) {
      filtered = filtered.filter(p => p.event_id === filterOptions.eventId);
    } else if (filterOptions.festivalSlug) {
      filtered = filtered.filter(p => p.festival_slug === filterOptions.festivalSlug);
    }

    const data = filtered.map((p, idx) => {
      const event = events.find(e => e.id === p.event_id);
      return {
        'S.No': idx + 1,
        'Full Name': p.full_name,
        'ERP Number': p.erp_number,
        'Email': p.email,
        'Mobile': p.mobile,
        'Department': p.department,
        'Year': p.year,
        'Section': p.section,
        'Event Name': p.event_name || event?.name || 'N/A',
        'Festival': p.festival_name || (event?.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'),
        'Participation Type': p.is_team ? `Team (${p.team_name || 'N/A'})` : 'Individual',
        'Status': (p.status || 'registered').toUpperCase(),
        'Registration Date': p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A',
      };
    });

    const prefix = filterOptions.eventName ? `${filterOptions.eventName.replace(/\s+/g, '_')}_Participants` : 'All_Festival_Participants';
    if (format === 'csv') exportToCSV(data, prefix);
    else exportToXLSX(data, prefix, 'Participants');
  },

  // Export Complete Event Package (Participants, Faculty, Student coordinators)
  async exportEventCompleteReport(eventId, eventName, format = 'xlsx') {
    const { assignments, participants } = await this.getExportData();
    const eventAssignments = assignments.filter(a => a.event_id === eventId);
    const eventParticipants = participants.filter(p => p.event_id === eventId);

    const facultySheet = eventAssignments
      .filter(a => a.role === 'faculty_coordinator')
      .map((a, i) => ({
        'S.No': i + 1,
        'Faculty Name': a.profiles?.full_name || 'N/A',
        'Employee ID': a.profiles?.employee_id || 'N/A',
        'Designation': a.profiles?.designation || 'N/A',
        'Department': a.profiles?.department || 'N/A',
        'Email': a.profiles?.email || 'N/A',
        'Mobile': a.profiles?.mobile || 'N/A',
        'Status': a.status
      }));

    const studentSheet = eventAssignments
      .filter(a => ['student_coordinator', 'co_coordinator', 'volunteer'].includes(a.role))
      .map((a, i) => ({
        'S.No': i + 1,
        'Student Name': a.profiles?.full_name || 'N/A',
        'ERP Number': a.profiles?.erp_number || 'N/A',
        'Department': a.profiles?.department || 'N/A',
        'Role': a.role.replace('_', ' ').toUpperCase(),
        'Email': a.profiles?.email || 'N/A',
        'Mobile': a.profiles?.mobile || 'N/A',
        'Status': a.status
      }));

    const participantSheet = eventParticipants.map((p, i) => ({
      'S.No': i + 1,
      'Student Name': p.full_name,
      'ERP Number': p.erp_number,
      'Email': p.email,
      'Mobile': p.mobile,
      'Department': p.department,
      'Year & Sec': `${p.year} - ${p.section}`,
      'Format': p.is_team ? `Team (${p.team_name || ''})` : 'Solo',
      'Status': p.status.toUpperCase(),
      'Registered At': new Date(p.created_at).toLocaleString()
    }));

    const cleanName = eventName.replace(/\s+/g, '_');

    if (format === 'csv') {
      exportToCSV(participantSheet, `${cleanName}_Complete_Report`);
      return;
    }

    exportConsolidatedWorkbook([
      { sheetName: 'Event Participants', data: participantSheet },
      { sheetName: 'Faculty Coordinators', data: facultySheet },
      { sheetName: 'Student Coordinators', data: studentSheet }
    ], `${cleanName}_Complete_Report`);
  },

  // Export Consolidated Master Excel Workbook
  async exportConsolidatedFestivalWorkbook() {
    const { festivals, events, assignments, participants } = await this.getExportData();

    // 1. Festival Summary
    const festivalSummary = festivals.map((f, i) => {
      const fEvents = events.filter(e => e.festival_id === f.id);
      const fEventIds = fEvents.map(e => e.id);
      const fParticipants = participants.filter(p => fEventIds.includes(p.event_id));
      const fAssignments = assignments.filter(a => fEventIds.includes(a.event_id) && a.status === 'active');

      return {
        'S.No': i + 1,
        'Festival Name': f.name,
        'Edition': f.edition,
        'Type': f.type.toUpperCase(),
        'Total Events': fEvents.length,
        'Total Active Coordinators': fAssignments.length,
        'Total Registered Participants': fParticipants.length,
        'Dates': `${f.start_date || 'TBD'} to ${f.end_date || 'TBD'}`,
        'Tagline': f.tagline
      };
    });

    // 2. Event List
    const eventList = events.map((e, i) => ({
      'S.No': i + 1,
      'Event Name': e.name,
      'Festival': e.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein',
      'Category': e.category,
      'Venue': e.venue,
      'Status': e.status.toUpperCase(),
      'Event Date': new Date(e.event_date).toLocaleDateString(),
      'Reg Deadline': new Date(e.registration_deadline).toLocaleDateString(),
      'Team Allowed': e.max_team_size > 1 ? `Yes (Max ${e.max_team_size})` : 'Individual Only',
      'Total Participants': participants.filter(p => p.event_id === e.id).length
    }));

    // 3. Faculty Coordinators
    const facultySheet = assignments
      .filter(a => a.role === 'faculty_coordinator' && a.status === 'active')
      .map((a, i) => {
        const ev = events.find(e => e.id === a.event_id);
        return {
          'S.No': i + 1,
          'Faculty Name': a.profiles?.full_name || 'N/A',
          'Employee ID': a.profiles?.employee_id || 'N/A',
          'Designation': a.profiles?.designation || 'N/A',
          'Department': a.profiles?.department || 'N/A',
          'Email': a.profiles?.email || 'N/A',
          'Assigned Event': ev?.name || 'N/A',
          'Festival': ev?.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'
        };
      });

    // 4. Student Coordinators
    const studentSheet = assignments
      .filter(a => a.role === 'student_coordinator' && a.status === 'active')
      .map((a, i) => {
        const ev = events.find(e => e.id === a.event_id);
        return {
          'S.No': i + 1,
          'Student Name': a.profiles?.full_name || 'N/A',
          'ERP Number': a.profiles?.erp_number || 'N/A',
          'Department': a.profiles?.department || 'N/A',
          'Year': a.profiles?.year || 'N/A',
          'Assigned Event': ev?.name || 'N/A',
          'Festival': ev?.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'
        };
      });

    // 5. Co-Coordinators
    const coSheet = assignments
      .filter(a => ['co_coordinator', 'volunteer'].includes(a.role) && a.status === 'active')
      .map((a, i) => {
        const ev = events.find(e => e.id === a.event_id);
        return {
          'S.No': i + 1,
          'Student Name': a.profiles?.full_name || 'N/A',
          'Role': a.role === 'co_coordinator' ? 'Co-Coordinator' : 'Volunteer',
          'ERP Number': a.profiles?.erp_number || 'N/A',
          'Department': a.profiles?.department || 'N/A',
          'Assigned Event': ev?.name || 'N/A',
        };
      });

    // 6. Esperenza Participants
    const espParticipants = participants
      .filter(p => p.festival_slug === 'esperanza')
      .map((p, i) => ({
        'S.No': i + 1,
        'Student Name': p.full_name,
        'ERP Number': p.erp_number,
        'Department': p.department,
        'Event': p.event_name,
        'Team': p.team_name || 'Individual',
        'Status': p.status.toUpperCase(),
        'Mobile': p.mobile,
        'Email': p.email
      }));

    // 7. Aashayein Participants
    const aashParticipants = participants
      .filter(p => p.festival_slug === 'aashayein')
      .map((p, i) => ({
        'S.No': i + 1,
        'Student Name': p.full_name,
        'ERP Number': p.erp_number,
        'Department': p.department,
        'Event': p.event_name,
        'Team': p.team_name || 'Individual',
        'Status': p.status.toUpperCase(),
        'Mobile': p.mobile,
        'Email': p.email
      }));

    // 8. Event-wise Summary
    const eventSummary = events.map((e, i) => {
      const parts = participants.filter(p => p.event_id === e.id);
      const coords = assignments.filter(a => a.event_id === e.id && a.status === 'active');
      return {
        'S.No': i + 1,
        'Event Name': e.name,
        'Festival': e.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein',
        'Faculty Leads': coords.filter(a => a.role === 'faculty_coordinator').length,
        'Student Leads': coords.filter(a => a.role === 'student_coordinator').length,
        'Co-Coordinators': coords.filter(a => a.role === 'co_coordinator').length,
        'Total Registrations': parts.length,
        'Confirmed': parts.filter(p => p.status === 'confirmed').length,
        'Status': e.status.toUpperCase()
      };
    });

    exportConsolidatedWorkbook([
      { sheetName: 'Festival Summary', data: festivalSummary },
      { sheetName: 'Event List', data: eventList },
      { sheetName: 'Faculty Coordinators', data: facultySheet },
      { sheetName: 'Student Coordinators', data: studentSheet },
      { sheetName: 'Co-Coordinators', data: coSheet },
      { sheetName: 'Esperenza Participants', data: espParticipants },
      { sheetName: 'Aashayein Participants', data: aashParticipants },
      { sheetName: 'Event-wise Summary', data: eventSummary }
    ], 'ESPERENZA_AASHAYEIN_2026_MASTER_WORKBOOK');
  }
};
