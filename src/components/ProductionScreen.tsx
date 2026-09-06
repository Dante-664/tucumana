import React, { useState } from 'react';
import { BatchTanda } from '../types';
import { BRAND_IMAGES } from '../mockData';

interface ProductionScreenProps {
  currentShift: string;
  onShiftChange: (shift: string) => void;
  tandas: BatchTanda[];
  onAddTanda: (tanda: BatchTanda) => void;
  onShowToast: (msg: string) => void;
  productionStats: {
    producidas: number;
    vendidas: number;
    enVitrina: number;
    saladas: { producidas: number; vendidas: number; disponibles: number };
    dulces: { producidas: number; vendidas: number; disponibles: number };
    arabes: { producidas: number; vendidas: number; disponibles: number };
  };
  onUpdateProductionStats: (addedSaladas: number, addedDulces: number, addedArabes: number) => void;
}

export const ProductionScreen: React.FC<ProductionScreenProps> = ({
  currentShift,
  onShiftChange,
  tandas,
  onAddTanda,
  onShowToast,
  productionStats,
  onUpdateProductionStats,
}) => {
  const [saladasInput, setSaladasInput] = useState<number>(120);
  const [dulcesInput, setDulcesInput] = useState<number>(40);
  const [arabesInput, setArabesInput] = useState<number>(60);
  const [selectedHorno, setSelectedHorno] = useState('Horno #1');
  const [showOvenSelect, setShowOvenSelect] = useState(false);

  const totalHorneada = saladasInput + dulcesInput + arabesInput;

  const handleQuickAddArabes = () => {
    setArabesInput((prev) => prev + 30);
    onShowToast('⚡ +30 Árabes agregadas a la bandeja');
  };

  const handleRegisterHorneada = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalHorneada <= 0) {
      onShowToast('Ingresa al menos 1 empanada para hornear');
      return;
    }

    const nextNumber = (tandas[0]?.number || 4) + 1;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} hs`;

    const newTanda: BatchTanda = {
      id: `tanda-${Date.now()}`,
      number: nextNumber,
      units: totalHorneada,
      time: timeStr,
      cook: 'Turno Noche',
      oven: selectedHorno.replace('#', '').trim(),
      status: 'Recién Salida',
    };

    onAddTanda(newTanda);
    onUpdateProductionStats(saladasInput, dulcesInput, arabesInput);
    onShowToast(`🔥 ¡Horneada #${nextNumber} (${totalHorneada} u.) registrada exitosamente!`);

    // Reset inputs
    setSaladasInput(60);
    setDulcesInput(24);
    setArabesInput(36);
  };

  const todayDateString = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2">
      {/* Date & Shift Selector */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">calendar_today</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-blue-600 uppercase tracking-wider font-extrabold">
                Planilla de Horno
              </span>
              <h2 className="font-extrabold text-[17px] text-slate-900 truncate capitalize">
                Hoy, {todayDateString}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onShiftChange(currentShift === 'Turno Noche' ? 'Turno Tarde' : 'Turno Noche')
            }
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-transform active:scale-95 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-blue-600">bedtime</span>
            <span>{currentShift}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
          </button>
        </div>
      </section>

      {/* Warning Stock Banner */}
      <section className="bg-amber-50 text-amber-900 rounded-2xl p-4 shadow-xs border border-amber-200 flex items-start gap-3 relative overflow-hidden">
        <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px]">warning</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-amber-800">
              Atención Cocina
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="text-[13px] text-slate-800 mt-0.5 leading-snug">
            Quedan pocas <strong className="font-bold">Árabes (Sfijas)</strong> para cubrir el pico del turno noche.
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickAddArabes}
          className="self-center bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform flex items-center gap-1 flex-shrink-0 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>+30</span>
        </button>
      </section>

      {/* Real-time Metric Cards */}
      <section className="grid grid-cols-3 gap-2">
        {/* Producidas */}
        <div className="bg-white p-3 rounded-2xl flex flex-col justify-between shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold">Producidas</span>
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined text-[15px]">outdoor_grill</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-extrabold text-[24px] text-slate-900 tabular-nums">
              {productionStats.producidas}
            </span>
            <span className="text-[11px] text-slate-400 ml-0.5">u.</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-slate-400 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Vendidas */}
        <div className="bg-white p-3 rounded-2xl flex flex-col justify-between shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold">Vendidas</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-extrabold text-[24px] text-blue-600 tabular-nums">
              {productionStats.vendidas}
            </span>
            <span className="text-[11px] text-blue-600 ml-0.5">u.</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (productionStats.vendidas / (productionStats.producidas || 1)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* En Vitrina */}
        <div className="bg-white p-3 rounded-2xl flex flex-col justify-between shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold">En Vitrina</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-extrabold text-[24px] text-emerald-600 tabular-nums">
              {productionStats.enVitrina}
            </span>
            <span className="text-[11px] text-emerald-600 ml-0.5">u.</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (productionStats.enVitrina / (productionStats.producidas || 1)) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Section: Nueva Horneada */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">skillet</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-slate-800">Nueva Horneada</h3>
              <p className="text-[12px] text-slate-400">Ingreso táctil de bandejas listas</p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOvenSelect(!showOvenSelect)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full text-slate-700 font-bold transition-colors cursor-pointer border border-slate-200"
            >
              {selectedHorno}
            </button>
            {showOvenSelect && (
              <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-xl border border-slate-200 p-1 w-28">
                {['Horno #1', 'Horno #2', 'Horno #3'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setSelectedHorno(h);
                      setShowOvenSelect(false);
                    }}
                    className="w-full text-left text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleRegisterHorneada} className="space-y-3">
          {/* Variedad 1: Saladas */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 shadow-xs">
                <img
                  src={BRAND_IMAGES.saladas}
                  alt="Empanadas Saladas"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[14px] text-slate-800 truncate">Saladas</div>
                <div className="text-[12px] text-slate-400 truncate">Carne, Jamón &amp; Q., Pollo</div>
              </div>
            </div>

            <div className="flex items-center bg-white rounded-xl p-1 shadow-xs border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSaladasInput((prev) => Math.max(0, prev - 12))}
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                min="0"
                step="6"
                value={saladasInput}
                onChange={(e) => setSaladasInput(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 text-center font-extrabold text-[16px] text-slate-800 bg-transparent focus:outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => setSaladasInput((prev) => prev + 12)}
                className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Variedad 2: Dulces */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 shadow-xs">
                <img
                  src={BRAND_IMAGES.dulces}
                  alt="Empanadas Dulces"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[14px] text-slate-800 truncate">Dulces</div>
                <div className="text-[12px] text-slate-400 truncate">Membrillo, Batata, Manzana</div>
              </div>
            </div>

            <div className="flex items-center bg-white rounded-xl p-1 shadow-xs border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setDulcesInput((prev) => Math.max(0, prev - 6))}
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                min="0"
                step="6"
                value={dulcesInput}
                onChange={(e) => setDulcesInput(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 text-center font-extrabold text-[16px] text-slate-800 bg-transparent focus:outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => setDulcesInput((prev) => prev + 6)}
                className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Variedad 3: Árabes */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 shadow-xs">
                <img
                  src={BRAND_IMAGES.arabes}
                  alt="Empanadas Árabes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[14px] text-slate-800 truncate">Árabes (Sfijas)</div>
                <div className="text-[12px] text-slate-400 truncate">Carne molida al limón</div>
              </div>
            </div>

            <div className="flex items-center bg-white rounded-xl p-1 shadow-xs border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setArabesInput((prev) => Math.max(0, prev - 6))}
                className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                min="0"
                step="6"
                value={arabesInput}
                onChange={(e) => setArabesInput(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 text-center font-extrabold text-[16px] text-slate-800 bg-transparent focus:outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => setArabesInput((prev) => prev + 6)}
                className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full min-h-[46px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            <span>+ Registrar Horneada ({totalHorneada} u.)</span>
          </button>
        </form>
      </section>

      {/* Section: Balance por Variedad */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[16px] text-slate-800">Balance por Variedad</h3>
            <p className="text-[12px] text-slate-400">Monitoreo continuo de stock en vitrina</p>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En Vivo
          </span>
        </div>

        <div className="space-y-3">
          {/* Saladas */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="font-bold text-[14px] text-slate-800">Empanadas Saladas</span>
              </div>
              <span className="text-[12px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                {productionStats.saladas.disponibles} u. libres
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center bg-white rounded-lg py-2 px-1 border border-slate-200/60">
              <div>
                <div className="text-[11px] text-slate-400">Producidas</div>
                <div className="font-bold text-[16px] text-slate-800 tabular-nums">
                  {productionStats.saladas.producidas}
                </div>
              </div>
              <div className="border-l border-r border-slate-100">
                <div className="text-[11px] text-slate-400">Vendidas</div>
                <div className="font-bold text-[16px] text-blue-600 tabular-nums">
                  {productionStats.saladas.vendidas}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-600 font-semibold">Disponibles</div>
                <div className="font-extrabold text-[16px] text-emerald-600 tabular-nums">
                  {productionStats.saladas.disponibles}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden flex">
              <div
                className="bg-blue-600 h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (productionStats.saladas.vendidas / (productionStats.saladas.producidas || 1)) * 100
                  )}%`,
                }}
              />
              <div
                className="bg-emerald-500 h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (productionStats.saladas.disponibles / (productionStats.saladas.producidas || 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Dulces */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="font-bold text-[14px] text-slate-800">Empanadas Dulces</span>
              </div>
              <span className="text-[12px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                {productionStats.dulces.disponibles} u. libres
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center bg-white rounded-lg py-2 px-1 border border-slate-200/60">
              <div>
                <div className="text-[11px] text-slate-400">Producidas</div>
                <div className="font-bold text-[16px] text-slate-800 tabular-nums">
                  {productionStats.dulces.producidas}
                </div>
              </div>
              <div className="border-l border-r border-slate-100">
                <div className="text-[11px] text-slate-400">Vendidas</div>
                <div className="font-bold text-[16px] text-blue-600 tabular-nums">
                  {productionStats.dulces.vendidas}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-600 font-semibold">Disponibles</div>
                <div className="font-extrabold text-[16px] text-slate-700 tabular-nums">
                  {productionStats.dulces.disponibles}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden flex">
              <div
                className="bg-blue-600 h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (productionStats.dulces.vendidas / (productionStats.dulces.producidas || 1)) * 100
                  )}%`,
                }}
              />
              <div
                className="bg-rose-400 h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (productionStats.dulces.disponibles / (productionStats.dulces.producidas || 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Árabes */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-[14px] text-slate-800">Empanadas Árabes (Sfijas)</span>
              </div>
              <span className="text-[12px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">bolt</span>
                <span>{productionStats.arabes.disponibles} u. libres</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center bg-white rounded-lg py-2 px-1 border border-slate-200/60">
              <div>
                <div className="text-[11px] text-slate-400">Producidas</div>
                <div className="font-bold text-[16px] text-slate-800 tabular-nums">
                  {productionStats.arabes.producidas}
                </div>
              </div>
              <div className="border-l border-r border-slate-100">
                <div className="text-[11px] text-slate-400">Vendidas</div>
                <div className="font-bold text-[16px] text-blue-600 tabular-nums">
                  {productionStats.arabes.vendidas}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-amber-700 font-semibold">Disponibles</div>
                <div className="font-extrabold text-[16px] text-amber-700 tabular-nums">
                  {productionStats.arabes.disponibles}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden flex">
              <div
                className="bg-blue-600 h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (productionStats.arabes.vendidas / (productionStats.arabes.producidas || 1)) * 100
                  )}%`,
                }}
              />
              <div
                className="bg-amber-500 h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (productionStats.arabes.disponibles / (productionStats.arabes.producidas || 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Historial de Tandas */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">history</span>
            <h3 className="font-bold text-[16px] text-slate-800">Historial de Tandas</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">{currentShift}</span>
        </div>

        <div className="space-y-2.5">
          {tandas.map((tanda) => (
            <div
              key={tanda.id}
              className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between transition-all hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-[15px]">
                  #{tanda.number}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-slate-800">
                      Tanda #{tanda.number} ({tanda.units} u.)
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.2 rounded-full">
                      {tanda.time}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">chef_hat</span>
                    <span>
                      Cocinero: <strong>{tanda.cook}</strong> ({tanda.oven})
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    tanda.status === 'Recién Salida'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : tanda.status === 'Listo'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {tanda.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
