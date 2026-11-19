import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Building, GraduationCap, CheckCircle2, Clock, Shield } from 'lucide-react';

export default function FacultyProfile() {
  const { profile, isVerifiedFaculty } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-navy-blue text-white flex items-center justify-center font-black text-2xl">
            {profile?.full_name?.charAt(0) || 'F'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-navy-blue">{profile?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-primary-blue">{profile?.designation || 'Faculty Coordinator'}</span>
              {isVerifiedFaculty ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Faculty</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>Pending Admin Verification</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee ID</span>
            <span className="font-mono font-bold text-navy-blue text-sm mt-0.5 block">{profile?.employee_id || 'Not Assigned'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Department</span>
            <span className="font-bold text-navy-blue text-sm mt-0.5 block">{profile?.department || 'General'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
            <span className="font-semibold text-navy-blue text-sm mt-0.5 block truncate">{profile?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Number</span>
            <span className="font-semibold text-navy-blue text-sm mt-0.5 block">{profile?.mobile || 'N/A'}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-slate-500 space-y-1">
          <div className="font-bold text-navy-blue">Account Security & Verification Notice:</div>
          <p>
            Role permissions and departmental affiliations are governed by the College Festival Administration Board. For credential modifications or event reassignment, please contact the Super Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
