import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-light-blue-100 text-primary-blue border-light-blue-200',
    navy: 'bg-navy-blue text-white border-navy-blue',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-850 border-amber-300',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
