import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function StudentProfile() {
  const { profile } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-blue text-white flex items-center justify-center font-black text-2xl">
            {profile?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-navy-blue">{profile?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-primary-blue">Student Coordinator</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Coordinator</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">ERP Enrollment Number</span>
            <span className="font-mono font-bold text-navy-blue text-sm mt-0.5 block">{profile?.erp_number || 'N/A'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Department</span>
            <span className="font-bold text-navy-blue text-sm mt-0.5 block">{profile?.department || 'Computer Science'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class Year & Section</span>
            <span className="font-bold text-navy-blue text-sm mt-0.5 block">{profile?.year || '3rd Year'} - Sec {profile?.section || 'A'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">College Email</span>
            <span className="font-semibold text-navy-blue text-sm mt-0.5 block truncate">{profile?.email}</span>
          </div>
        </div>

        <div className="p-4 bg-light-blue-50/60 rounded-2xl border border-light-blue-200/80 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-navy-blue">Student Leadership Role Responsibilities:</div>
          <p>
            As an assigned student coordinator, you are authorized to verify attendance and inspect registration details for your competition. To request event reassignment or updates to your academic ERP records, please reach out to your faculty coordinator in-charge.
          </p>
        </div>
      </div>
    </div>
  );
}
