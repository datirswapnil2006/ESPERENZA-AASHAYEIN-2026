import React, { useState, useEffect } from 'react';
import { coordinatorService } from '../../services/coordinatorService';
import { eventService } from '../../services/eventService';
import { Users, Search, Mail, Phone, Calendar, CheckCircle2 } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminStudentCoordinators() {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [stuList, assignList, evtList] = await Promise.all([
        coordinatorService.getStudentCoordinators(),
        coordinatorService.getAllAssignments(),
        eventService.getAllEvents()
      ]);
      setStudents(stuList || []);
      setAssignments(assignList || []);
      setEvents(evtList || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    return s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.erp_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>STUDENT LEADERSHIP ROSTER</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Student Coordinators</h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered student representatives, ERP records, and active competition assignments.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 bg-primary-blue/10 text-primary-blue rounded-xl border border-primary-blue/20">
          {students.length} Registered Coordinators
        </span>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-light-blue-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ERP, or department..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No student coordinators found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-light-blue-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-light-blue-200/80 text-navy-blue font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Student Coordinator</th>
                  <th className="py-4 px-6">ERP & Academic Info</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Assigned Competitions & Roles</th>
                  <th className="py-4 px-6">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-navy-text">
                {filteredStudents.map((s) => {
                  const studentAssignments = assignments.filter(a => a.user_id === s.id && a.status === 'active');

                  return (
                    <tr key={s.id} className="hover:bg-light-blue-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-navy-blue text-sm">{s.full_name}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-light-blue-100 text-primary-blue">
                          Active Student Coordinator
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <div className="font-bold text-navy-blue">{s.erp_number || 'N/A'}</div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">{s.year || '3rd Year'} - Sec {s.section || 'A'}</div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-700">
                        {s.department || 'Computer Science'}
                      </td>

                      <td className="py-4 px-6">
                        {studentAssignments.length === 0 ? (
                          <span className="text-slate-400 italic">No assigned events</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {studentAssignments.map(a => {
                              const ev = events.find(e => e.id === a.event_id);
                              return (
                                <div key={a.id} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="font-bold text-navy-blue">{ev?.name || 'Event'}</span>
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                                    {a.role.replace('_', ' ')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-primary-blue" />
                          <span>{s.email}</span>
                        </div>
                        {s.mobile && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{s.mobile}</span>
                          </div>
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

    </div>
  );
}
