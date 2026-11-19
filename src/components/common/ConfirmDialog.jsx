import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) {
  const btnVariants = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    primary: 'bg-primary-blue hover:bg-primary-blue-hover text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3 w-full pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-sm ${btnVariants[confirmVariant] || btnVariants.danger}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
