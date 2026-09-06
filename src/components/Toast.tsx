import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-2xl text-[13px] font-semibold flex items-center gap-2 max-w-[90vw] animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700/80">
      <span className="material-symbols-outlined text-emerald-400 text-[18px] flex-shrink-0">
        check_circle
      </span>
      <span className="truncate">{message}</span>
    </div>
  );
};
