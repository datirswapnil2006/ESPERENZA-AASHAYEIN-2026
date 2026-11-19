import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, subtitle, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-light-blue-100 text-primary-blue border-light-blue-200',
    navy: 'bg-navy-blue/10 text-navy-blue border-navy-blue/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-light-blue-200/60 shadow-soft hover:shadow-soft-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-navy-blue mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl border ${colorMap[color] || colorMap.blue} flex items-center justify-center shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-emerald-600">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
