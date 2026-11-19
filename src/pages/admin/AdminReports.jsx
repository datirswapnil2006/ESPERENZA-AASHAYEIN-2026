import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { eventService } from '../../services/eventService';
import { 
  FileSpreadsheet, 
  Download, 
  Layers, 
  GraduationCap, 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  FileText
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminReports() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const evts = await eventService.getAllEvents();
        setEvents(evts || []);
        if (evts && evts.length > 0) {
          setSelectedEventId(evts[0].id);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleExport = async (exportFn) => {
    setExporting(true);
    try {
      await exportFn();
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EXPORT & AUDIT TELEMETRY</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Reports & Data Downloads</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate consolidated multi-sheet Excel workbooks, event-specific packages, and raw CSV files directly from Supabase.
          </p>
        </div>

        <button
          onClick={() => handleExport(() => reportService.exportConsolidatedFestivalWorkbook())}
          disabled={exporting}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download Consolidated Master Excel (8 Sheets)</span>
        </button>
      </div>

      {/* Section 1: Master Multi-Sheet Consolidated Workbook Highlight */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-navy-blue text-white rounded-3xl p-8 shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONSOLIDATED MASTER WORKBOOK</span>
          </div>
          <h3 className="text-2xl font-black">Official College Festival Master Workbook</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consolidates the complete institutional festival database into one formatted .XLSX workbook with 8 individual sheets:
            <strong> 1. Festival Summary, 2. Event List, 3. Faculty Coordinators, 4. Student Coordinators, 5. Co-Coordinators, 6. Esperenza Participants, 7. Aashayein Participants, 8. Event-wise Summary.</strong>
          </p>
        </div>

        <button
          onClick={() => handleExport(() => reportService.exportConsolidatedFestivalWorkbook())}
          disabled={exporting}
          className="px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs shadow-soft transition-all shrink-0 flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Master Workbook (.XLSX)</span>
        </button>
      </div>

      {/* Section 2: General & Festival-Wide Downloads */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-navy-blue">
          General Institutional Downloads (CSV & XLSX)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card: Faculty Coordinators */}
          <div className="bg-white p-5 rounded-2xl border border-light-blue-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-navy-blue text-white flex items-center justify-center font-bold mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-blue">Faculty Coordinators</h4>
              <p className="text-xs text-slate-500 mt-1">
                Full list with Employee IDs, designations, verified status, and assigned competitions.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleExport(() => reportService.exportFacultyCoordinators('xlsx'))}
                className="flex-1 py-1.5 px-3 rounded-lg bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold text-center"
              >
                XLSX
              </button>
              <button
                onClick={() => handleExport(() => reportService.exportFacultyCoordinators('csv'))}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Card: Student Coordinators */}
          <div className="bg-white p-5 rounded-2xl border border-light-blue-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary-blue text-white flex items-center justify-center font-bold mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-blue">Student Coordinators</h4>
              <p className="text-xs text-slate-500 mt-1">
                Main student leads with ERP numbers, year, department, and assigned events.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleExport(() => reportService.exportStudentCoordinators('xlsx', 'student_coordinator'))}
                className="flex-1 py-1.5 px-3 rounded-lg bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold text-center"
              >
                XLSX
              </button>
              <button
                onClick={() => handleExport(() => reportService.exportStudentCoordinators('csv', 'student_coordinator'))}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Card: Co-Coordinators & Volunteers */}
          <div className="bg-white p-5 rounded-2xl border border-light-blue-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-blue">Co-Coordinators & Volunteers</h4>
              <p className="text-xs text-slate-500 mt-1">
                Supporting coordinator cohort with contact info and assigned stages.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleExport(() => reportService.exportStudentCoordinators('xlsx', 'co_coordinator'))}
                className="flex-1 py-1.5 px-3 rounded-lg bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold text-center"
              >
                XLSX
              </button>
              <button
                onClick={() => handleExport(() => reportService.exportStudentCoordinators('csv', 'co_coordinator'))}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Card: All Participants */}
          <div className="bg-white p-5 rounded-2xl border border-light-blue-200 shadow-soft flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-3">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-navy-blue">Consolidated Participants</h4>
              <p className="text-xs text-slate-500 mt-1">
                Complete roster of all student registrations across both technical and cultural tracks.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleExport(() => reportService.exportParticipants('xlsx'))}
                className="flex-1 py-1.5 px-3 rounded-lg bg-light-blue-100 text-primary-blue hover:bg-light-blue-200 text-xs font-bold text-center"
              >
                XLSX
              </button>
              <button
                onClick={() => handleExport(() => reportService.exportParticipants('csv'))}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold text-center"
              >
                CSV
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Section 3: Event-Wise Reports Module (Section 16 Requirement) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-light-blue-200 shadow-soft space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-navy-blue flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-blue" />
            <span>Event-Wise Reports & Downloads</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Download dedicated files for individual competitions (e.g. Dance, Robo Race, Young Scientist).
          </p>
        </div>

        {/* Event Selector */}
        <div className="max-w-md">
          <label className="block text-xs font-bold text-navy-blue mb-1.5">Select Competition *</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-navy-blue focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'})
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-navy-blue">{selectedEvent.name}</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-xs text-slate-500">{selectedEvent.venue}</span>
              </div>
              <span className="text-[11px] font-bold uppercase text-primary-blue bg-light-blue-100 px-2.5 py-0.5 rounded-full">
                {selectedEvent.festival_slug}
              </span>
            </div>

            {/* 4 Dedicated Event Downloads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Student Coordinators */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-bold text-navy-blue text-xs">1. Student Coordinators</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{selectedEvent.slug}_Student_Coordinators.xlsx</p>
                </div>
                <button
                  onClick={() => handleExport(() => reportService.exportStudentCoordinators('xlsx', 'all'))}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-primary-blue" />
                  <span>Download XLSX</span>
                </button>
              </div>

              {/* 2. Faculty Coordinators */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-bold text-navy-blue text-xs">2. Faculty Coordinators</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{selectedEvent.slug}_Faculty_Coordinators.xlsx</p>
                </div>
                <button
                  onClick={() => handleExport(() => reportService.exportFacultyCoordinators('xlsx'))}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-primary-blue" />
                  <span>Download XLSX</span>
                </button>
              </div>

              {/* 3. Participants */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-bold text-navy-blue text-xs">3. Event Participants</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{selectedEvent.slug}_Participants.xlsx</p>
                </div>
                <button
                  onClick={() => handleExport(() => reportService.exportParticipants('xlsx', { eventId: selectedEvent.id, eventName: selectedEvent.name }))}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-primary-blue" />
                  <span>Download XLSX</span>
                </button>
              </div>

              {/* 4. Complete Package */}
              <div className="p-4 rounded-2xl bg-light-blue-50/70 border border-light-blue-200 flex flex-col justify-between space-y-3">
                <div>
                  <h5 className="font-bold text-primary-blue text-xs">4. Complete Report</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{selectedEvent.slug}_Complete_Report.xlsx</p>
                </div>
                <button
                  onClick={() => handleExport(() => reportService.exportEventCompleteReport(selectedEvent.id, selectedEvent.name, 'xlsx'))}
                  className="w-full py-2 px-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Complete Package</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
