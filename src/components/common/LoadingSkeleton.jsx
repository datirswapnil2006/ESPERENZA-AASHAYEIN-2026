import React from 'react';

export function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded-md w-full"></div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-light-blue-200 animate-pulse space-y-4">
      <div className="h-48 bg-slate-200 rounded-xl w-full"></div>
      <div className="h-5 bg-slate-200 rounded w-2/3"></div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
}
