import React from 'react';

interface BottomNavProps {
  currentTab: 'pedidos' | 'nueva-venta' | 'produccion' | 'caja-gastos';
  onTabChange: (tab: 'pedidos' | 'nueva-venta' | 'produccion' | 'caja-gastos') => void;
  activeOrdersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  activeOrdersCount,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-2px_10px_rgba(15,23,42,0.04)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-stretch justify-around h-20 px-2 max-w-xl mx-auto">
        {/* Tab 1: Pedidos */}
        <button
          type="button"
          onClick={() => onTabChange('pedidos')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'pedidos'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-xs">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Pedidos</span>
        </button>

        {/* Tab 2: Nueva Venta (Hero Elevated POS button) */}
        <button
          type="button"
          onClick={() => onTabChange('nueva-venta')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'nueva-venta'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-200 -mt-5 hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[26px]">point_of_sale</span>
          </div>
          <span className="text-[11px] tracking-tight mt-1 font-semibold">Nueva Venta</span>
        </button>

        {/* Tab 3: Producción */}
        <button
          type="button"
          onClick={() => onTabChange('produccion')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'produccion'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">skillet</span>
          <span className="text-[11px] tracking-tight">Producción</span>
        </button>

        {/* Tab 4: Caja & Gastos */}
        <button
          type="button"
          onClick={() => onTabChange('caja-gastos')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'caja-gastos'
              ? 'text-blue-600 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          <span className="text-[11px] tracking-tight">Caja &amp; Gastos</span>
        </button>
      </div>
    </nav>
  );
};
