import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title = 'No records found', description = 'There are currently no items to display.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed border-light-blue-200 bg-cream-50/50 my-4">
      <div className="p-4 bg-light-blue-100 text-primary-blue rounded-2xl mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-navy-blue mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
