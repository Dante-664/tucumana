import React, { useState, useMemo } from 'react';
import { Expense } from '../types';

interface CashExpensesScreenProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onShowToast: (msg: string) => void;
  totalSalesCash: number;
  totalSalesDigital: number;
  orderCount: number;
}

export const CashExpensesScreen: React.FC<CashExpensesScreenProps> = ({
  expenses,
  onAddExpense,
  onShowToast,
  totalSalesCash,
  totalSalesDigital,
  orderCount,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'hoy' | 'ayer' | 'semana' | 'mes'>('hoy');
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // New Expense form state
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseMethod, setExpenseMethod] = useState<'Efectivo' | 'Transferencia' | 'Mercado Pago'>('Efectivo');

  // Sum of expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const cashExpenses = useMemo(() => {
    return expenses.filter((e) => e.method === 'Efectivo').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Overall totals
  // Base numbers seeded from the design
  const baseCashSales = 148500 + totalSalesCash;
  const baseDigitalSales = 112300 + totalSalesDigital;
  const grossSales = baseCashSales + baseDigitalSales;
  const netBalance = grossSales - totalExpenses;
  const totalOrders = 28 + orderCount;

  // Actual physical cash in drawer
  const cashInDrawer = baseCashSales - cashExpenses;

  const handlePeriodChange = (period: 'hoy' | 'ayer' | 'semana' | 'mes', label: string) => {
    setSelectedPeriod(period);
    onShowToast(`Filtrando arqueo: ${label}`);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseConcept.trim() || !expenseAmount || Number(expenseAmount) <= 0) {
      onShowToast('Completa concepto y monto del egreso');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} hs`;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      concept: expenseConcept.trim(),
      amount: Number(expenseAmount),
      method: expenseMethod,
      time: timeStr,
      category: 'shopping_cart',
    };

    onAddExpense(newExpense);
    onShowToast(`✅ Gasto anotado: $${Number(expenseAmount).toLocaleString('es-AR')}`);

    // Reset form
    setExpenseConcept('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };

  const handleExportExcel = () => {
    // Generate CSV content and trigger clean download
    const headers = 'ID,Concepto,Monto,Metodo,Hora\n';
    const rows = expenses
      .map((e) => `"${e.id}","${e.concept}",-${e.amount},"${e.method}","${e.time}"`)
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', 'Cierre_Caja_OvenEarth.csv');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('📥 Descargando archivo Cierre_Caja_OvenEarth.csv');
  };

  const handleSyncSheets = () => {
    onShowToast('☁️ Sincronizado exitosamente con Google Drive / Sheets');
  };

  const handleCloseShift = () => {
    onShowToast('🔒 Cierre de turno registrado. Arqueo cuadrado y archivado.');
  };

  const handleShareWhatsApp = () => {
    const summaryMsg = encodeURIComponent(
      `*Oven & Earth • Resumen de Caja*\n` +
      `📅 Fecha: ${new Date().toLocaleDateString('es-AR')}\n` +
      `💰 Balance Neto: $${netBalance.toLocaleString('es-AR')}\n` +
      `💵 Efectivo en Gaveta: $${cashInDrawer.toLocaleString('es-AR')}\n` +
      `💳 Bancos / MP: $${baseDigitalSales.toLocaleString('es-AR')}\n` +
      `🧾 Ventas Brutas: $${grossSales.toLocaleString('es-AR')} (${totalOrders} pedidos)\n` +
      `📉 Total Gastos: -$${totalExpenses.toLocaleString('es-AR')}\n\n` +
      `✅ Turno cerrado por Marcos V.`
    );
    window.open(`https://wa.me/?text=${summaryMsg}`, '_blank');
    onShowToast('💬 Abriendo resumen listo para WhatsApp...');
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2">
      {/* Date Filter Ribbon */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {[
          { id: 'hoy', label: 'Hoy', icon: 'calendar_today' },
          { id: 'ayer', label: 'Ayer' },
          { id: 'semana', label: 'Esta Semana' },
          { id: 'mes', label: 'Este Mes' },
        ].map((item) => {
          const isSelected = selectedPeriod === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePeriodChange(item.id as any, item.label)}
              className={`flex-1 py-1.5 px-2 text-center rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isSelected
                  ? 'text-white bg-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.icon && (
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Primary Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 rounded-2xl shadow-sm text-white border border-blue-500/30">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[20px] text-blue-200"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-blue-100">
                BALANCE NETO DEL DÍA
              </span>
            </div>
            <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-white/20">
              En Vivo
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="font-extrabold text-[32px] tracking-tight text-white leading-none tabular-nums">
              ${netBalance.toLocaleString('es-AR')}
            </span>
            <span className="text-[12px] text-blue-200 font-bold">ARS neto</span>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[12px] text-blue-100 font-medium">
            <span className="material-symbols-outlined text-[16px] text-emerald-300">trending_up</span>
            <span>Margen positivo luego de egresos operativos</span>
          </div>
        </div>
      </div>

      {/* 4-Box Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Efectivo en Caja */}
        <div className="bg-emerald-50/80 p-3.5 rounded-2xl shadow-xs border border-emerald-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-emerald-800 font-bold tracking-tight">
              Efectivo en Caja
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shadow-xs text-emerald-700">
              <span className="material-symbols-outlined text-[17px]">payments</span>
            </div>
          </div>
          <div>
            <div className="font-extrabold text-[20px] text-emerald-950 tracking-tight tabular-nums">
              ${cashInDrawer.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Físico en gaveta</span>
            </div>
          </div>
        </div>

        {/* Card 2: Transferencias / Banco */}
        <div className="bg-blue-50/80 p-3.5 rounded-2xl shadow-xs border border-blue-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-blue-800 font-bold tracking-tight">
              Transferencias / Banco
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shadow-xs text-blue-700">
              <span className="material-symbols-outlined text-[17px]">
                account_balance_wallet
              </span>
            </div>
          </div>
          <div>
            <div className="font-extrabold text-[20px] text-blue-950 tracking-tight tabular-nums">
              ${baseDigitalSales.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-blue-700 flex items-center gap-1 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>MP &amp; Galicia</span>
            </div>
          </div>
        </div>

        {/* Card 3: Ventas Brutas */}
        <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-600 font-bold tracking-tight">
              Ventas Brutas
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shadow-xs text-slate-600">
              <span className="material-symbols-outlined text-[17px]">receipt</span>
            </div>
          </div>
          <div>
            <div className="font-extrabold text-[20px] text-slate-900 tracking-tight tabular-nums">
              ${grossSales.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span>{totalOrders} pedidos cobrados</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Gastos */}
        <div className="bg-rose-50/80 p-3.5 rounded-2xl shadow-xs border border-rose-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-rose-800 font-bold tracking-tight">
              Total Gastos
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shadow-xs text-rose-700">
              <span className="material-symbols-outlined text-[17px]">arrow_downward</span>
            </div>
          </div>
          <div>
            <div className="font-extrabold text-[20px] text-rose-700 tracking-tight tabular-nums">
              -${totalExpenses.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-rose-600 flex items-center gap-1 mt-0.5">
              <span>{expenses.length} egresos hoy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Excel / CSV Export Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-xs">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              table_view
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[16px] text-slate-800">Exportación Excel / CSV</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
                Auto
              </span>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">
              Sincroniza automáticamente con tu planilla en Google Sheets o descarga el reporte contable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportExcel}
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Descargar .xlsx</span>
          </button>
          <button
            type="button"
            onClick={handleSyncSheets}
            className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer border border-slate-200"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              cloud_sync
            </span>
            <span>Google Drive</span>
          </button>
        </div>
      </div>

      {/* Gastos del Turno Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              local_atm
            </span>
            <h3 className="font-bold text-[16px] text-slate-800">Gastos del Turno</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showExpenseForm ? 'close' : 'add'}
            </span>
            <span>{showExpenseForm ? 'Cerrar' : 'Anotar Gasto'}</span>
          </button>
        </div>

        {/* Collapsible Expense Drawer */}
        {showExpenseForm && (
          <form
            onSubmit={handleSaveExpense}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-[14px] text-slate-800">Registrar Nuevo Egreso</span>
              <span className="text-[11px] text-slate-400">Libro Diario</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Concepto / Proveedor
                </label>
                <input
                  type="text"
                  value={expenseConcept}
                  onChange={(e) => setExpenseConcept(e.target.value)}
                  placeholder="Ej: Queso Mozzarella x 10kg"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 text-[14px] focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expenseAmount}
                    onChange={(e) =>
                      setExpenseAmount(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="0.00"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 text-[15px] font-extrabold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none border border-slate-200 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={expenseMethod}
                    onChange={(e) => setExpenseMethod(e.target.value as any)}
                    className="w-full h-10 px-2.5 rounded-xl bg-slate-50 text-slate-900 text-[13px] font-semibold focus:bg-white focus:outline-none border border-slate-200"
                  >
                    <option value="Efectivo">Efectivo (Caja)</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Guardar Egreso en Libro Diario</span>
              </button>
            </div>
          </form>
        )}

        {/* Expenses list */}
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                  <span className="material-symbols-outlined text-[20px]">
                    {exp.category || 'shopping_cart'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[14px] text-slate-800 truncate">
                    {exp.concept}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.2 rounded-full text-[10px] font-bold">
                      {exp.method}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      {exp.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-extrabold text-[16px] text-rose-600 tracking-tight tabular-nums">
                  -${exp.amount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Cash Closure Action Card */}
      <div className="bg-slate-100/90 p-4 rounded-2xl space-y-3 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
          </div>
          <div>
            <h4 className="font-bold text-[15px] text-slate-800">Cierre de Caja Diario</h4>
            <p className="text-[12px] text-slate-500">Genera informe para Dueños y Auditoría</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCloseShift}
            className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            <span>Cerrar Turno</span>
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Enviar WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
