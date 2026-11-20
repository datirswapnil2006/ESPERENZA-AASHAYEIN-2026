import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, UserCheck, Clock, User, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function DemoSwitcher() {
  const { profile, switchAccount } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const presets = [
    {
      role: 'Super Admin',
      email: 'admin@festival.edu',
      name: 'Dr. Nikko Khalsa',
      desc: 'Full administrative authority across festivals & reports',
      icon: Shield,
      color: 'bg-indigo-600',
    },
    {
      role: 'Verified Faculty',
      email: 'priya.nair@festival.edu',
      name: 'Dr. Priya Nair',
      desc: 'Assigned to Aashayein Dance (Form builder & reports)',
      icon: UserCheck,
      color: 'bg-emerald-600',
    },
    {
      role: 'Pending Faculty',
      email: 'neha.gupta@festival.edu',
      name: 'Dr. Neha Gupta',
      desc: 'Faculty waiting for Admin verification',
      icon: Clock,
      color: 'bg-amber-600',
    },
    {
      role: 'Student Coordinator',
      email: 'rohit.mehta@student.edu',
      name: 'Rohit Mehta',
      desc: 'Assigned Student Coordinator (Dance event)',
      icon: User,
      color: 'bg-primary-blue',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-soft-lg border border-light-blue-200 overflow-hidden text-xs transition-all w-72 sm:w-80">
        
        {/* Toggle Bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 bg-navy-blue text-white flex items-center justify-between font-semibold"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Role Switcher / Test Accounts</span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Current active user tag */}
        <div className="px-3.5 py-2 bg-cream-50 border-b border-light-blue-200 flex items-center justify-between text-navy-text">
          <span className="text-[11px] text-slate-500">Active:</span>
          <span className="font-bold truncate ml-2">
            {profile ? `${profile.full_name} (${profile.role?.replace('_', ' ')})` : 'Guest / Logged Out'}
          </span>
        </div>

        {/* Preset accounts dropdown */}
        {expanded && (
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            <p className="text-[11px] text-slate-500 font-medium">Switch persona to test permissions:</p>
            {presets.map((preset) => {
              const isCurrent = profile?.email === preset.email;
              const Icon = preset.icon;

              return (
                <button
                  key={preset.email}
                  onClick={() => {
                    switchAccount(preset.email);
                    setExpanded(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isCurrent
                      ? 'border-primary-blue bg-light-blue-50/80 shadow-sm'
                      : 'border-slate-100 hover:border-light-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg text-white ${preset.color} shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy-blue truncate">{preset.name}</span>
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-primary-blue shrink-0 ml-1" />}
                    </div>
                    <p className="text-[10px] font-semibold text-primary-blue">{preset.role}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{preset.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
