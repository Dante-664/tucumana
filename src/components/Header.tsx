import React, { useState } from 'react';
import { BRAND_IMAGES } from '../mockData';

interface HeaderProps {
  currentTab: 'pedidos' | 'nueva-venta' | 'produccion' | 'caja-gastos';
  currentShift: string;
  onShiftChange: (shift: string) => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentShift,
  onShiftChange,
  onSync,
  isSyncing,
}) => {
  const [showShiftMenu, setShowShiftMenu] = useState(false);

  const tabLabels: Record<string, string> = {
    pedidos: 'Pedidos',
    'nueva-venta': 'Nueva Venta',
    produccion: 'Producción',
    'caja-gastos': 'Caja & Gastos',
  };

  const shifts = ['Turno Noche', 'Turno Tarde', 'Turno Mañana'];

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
      <div className="max-w-xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Brand & Shift Info */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={BRAND_IMAGES.logo}
            alt="Oven & Earth Logo"
            className="h-9 w-auto object-contain flex-shrink-0 rounded-lg shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[17px] text-slate-900 tracking-tight truncate leading-tight">
                Oven &amp; Earth
              </span>
              <span
                className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                title="WhatsApp Sync Activo"
              />
            </div>
            <div className="flex items-center gap-1.5 relative">
              <button
                type="button"
                onClick={() => setShowShiftMenu(!showShiftMenu)}
                className="font-bold text-[11px] text-blue-600 uppercase tracking-wider hover:text-blue-700 flex items-center gap-0.5 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/70 transition-colors"
                title="Cambiar Turno"
              >
                <span>{currentShift}</span>
                <span className="material-symbols-outlined text-[13px]">expand_more</span>
              </button>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[12px] text-slate-500 font-medium truncate">
                {tabLabels[currentTab]}
              </span>

              {/* Shift Dropdown */}
              {showShiftMenu && (
                <div className="absolute top-7 left-0 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 min-w-[150px] flex flex-col gap-1 animate-in fade-in">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Seleccionar Turno
                  </div>
                  {shifts.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        onShiftChange(s);
                        setShowShiftMenu(false);
                      }}
                      className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                        currentShift === s
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right actions: Sync & Profile */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-700 transition-all cursor-pointer shadow-2xs"
            title="Sincronizar Pedidos y WhatsApp"
          >
            <span
              className={`material-symbols-outlined text-[15px] font-bold ${
                isSyncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span className="text-[11px] font-bold hidden sm:inline">
              Sync
            </span>
          </button>

          <div
            className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm text-white"
            title="Cajero / Operador Activo: Marcos V."
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
