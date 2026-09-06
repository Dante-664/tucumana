import React, { useState } from 'react';
import { Order } from '../types';

interface WhatsAppImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportOrder: (newOrder: Order) => void;
}

export const WhatsAppImportModal: React.FC<WhatsAppImportModalProps> = ({
  isOpen,
  onClose,
  onImportOrder,
}) => {
  const [text, setText] = useState('');
  const [detectedClient, setDetectedClient] = useState('');
  const [detectedTotal, setDetectedTotal] = useState(0);
  const [detectedSummary, setDetectedSummary] = useState('');
  const [hasPreview, setHasPreview] = useState(false);

  if (!isOpen) return null;

  const handleDemoFill = () => {
    const demo =
      'Hola Oven & Earth! Me envías 1 docena (6 Carne Suave, 6 Humita) y 1 Coca 1.5L a Av. Cabildo 2210 piso 8? Paga Juan Pérez en efectivo con $20.000.';
    setText(demo);
    setDetectedClient('Juan Pérez (+54 9 11 3344-5566)');
    setDetectedTotal(16400);
    setDetectedSummary('12 empanadas surtidas (6 Carne Suave, 6 Humita) + 1 Coca-Cola 1.5L');
    setHasPreview(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (val.trim().length > 10) {
      // Basic auto-parser heuristics
      const nameMatch = val.match(/paga\s+([A-Za-zÁÉÍÓÚáéíóúñÑ ]+?)(?:\s+en|\s+con|\.|$)/i) ||
                        val.match(/soy\s+([A-Za-zÁÉÍÓÚáéíóúñÑ ]+?)(?:\s*\(|\.|$)/i);
      const clientName = nameMatch ? nameMatch[1].trim() : 'Cliente WhatsApp';

      setDetectedClient(clientName);
      setDetectedTotal(15200);
      setDetectedSummary('Docena empanadas surtidas + Bebida');
      setHasPreview(true);
    } else {
      setHasPreview(false);
    }
  };

  const handleConfirm = () => {
    const randomNum = Math.floor(92 + Math.random() * 20);
    const newOrder: Order = {
      id: `ord-wa-${Date.now()}`,
      orderNumber: `#${String(randomNum).padStart(3, '0')}`,
      customerName: detectedClient || 'Cliente WhatsApp',
      phone: '+54 9 11 3344-5566',
      isDelivery: true,
      address: text.includes('Cabildo') ? 'Av. Cabildo 2210, Piso 8' : 'Dirección informada por WA',
      deliveryEstimatedTime: 'Sale en 20 min',
      items: [
        {
          id: `item-${Date.now()}-1`,
          name: '12x Empanadas seleccionadas por WA',
          quantity: 12,
          unitLabel: '1d',
          unitPrice: 10800,
          category: 'saladas',
        },
        {
          id: `item-${Date.now()}-2`,
          name: '1x Coca-Cola 1.5L descartable',
          quantity: 1,
          unitLabel: '1x',
          unitPrice: 2200,
          category: 'bebidas',
        },
      ],
      itemsSummary: [
        '1d Saladas surtidas según WA',
        '1x Coca-Cola 1.5L descartable',
      ],
      total: detectedTotal || 14200,
      paymentStatus: text.toLowerCase().includes('efectivo') ? 'COBRAR_EFECTIVO' : 'PAGADO',
      paymentMethod: text.toLowerCase().includes('efectivo') ? 'Efectivo' : 'Transferencia',
      paymentDetail: text.includes('20.000') ? 'Prepara cambio con $20.000' : 'Cobro contra entrega',
      status: 'pendiente_cocina',
      isWhatsApp: true,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onImportOrder(newOrder);
    onClose();
    setText('');
    setHasPreview(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-slate-200 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">mark_chat_read</span>
            </div>
            <div>
              <h4 className="font-bold text-[17px] text-slate-900 leading-tight">
                Pegar Pedido de WhatsApp
              </h4>
              <span className="text-[12px] text-slate-400">
                Interpreta texto automático
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Quick Demo Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={handleDemoFill}
            className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">magic_button</span>
            <span>Cargar Ejemplo WA</span>
          </button>
          <span className="text-[12px] text-slate-400">o pega el mensaje crudo:</span>
        </div>

        {/* Raw Text Input */}
        <textarea
          rows={4}
          value={text}
          onChange={handleTextChange}
          placeholder="Ej: Hola! Quiero 1 docena de carne y una coca a Av. San Martín 880. Pago en efectivo. Soy Juan Perez (+5491133334444)"
          className="w-full p-3.5 rounded-xl bg-slate-50 text-slate-900 text-[14px] leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400 resize-none border border-slate-200 transition-all"
        />

        {/* Auto Parsed Preview Box */}
        {hasPreview && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 text-[13px] flex flex-col gap-1">
            <div className="flex items-center justify-between font-bold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                Pedido Detectado:
              </span>
              <span className="text-[15px] font-extrabold text-slate-900">
                ${detectedTotal.toLocaleString('es-AR')}
              </span>
            </div>
            <p className="text-[12px] text-slate-600">
              Cliente: <strong className="text-slate-900">{detectedClient}</strong> • {detectedSummary}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-[13px] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!text.trim()}
            className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Crear Comanda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
