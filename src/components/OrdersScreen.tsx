import React, { useState, useMemo } from 'react';
import { Order } from '../types';

interface OrdersScreenProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onMarkDelivered: (orderId: string) => void;
  onOpenWhatsAppModal: () => void;
  onShowToast: (msg: string) => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  orders,
  onUpdateOrderStatus,
  onMarkDelivered,
  onOpenWhatsAppModal,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'whatsapp' | 'horno' | 'delivery'>('all');

  // Filter calculations
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Exclude already delivered from main active view unless searching specifically
      const isDelivered = ord.status === 'entregado';
      if (isDelivered && !searchQuery.trim()) return false;

      // Filter category
      if (activeFilter === 'whatsapp' && !ord.isWhatsApp) return false;
      if (activeFilter === 'horno' && ord.status !== 'en_horno' && ord.status !== 'pendiente_cocina') return false;
      if (activeFilter === 'delivery' && (ord.status !== 'en_camino' || !ord.isDelivery)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ord.customerName.toLowerCase().includes(q);
        const matchPhone = ord.phone.toLowerCase().includes(q);
        const matchAddr = ord.address?.toLowerCase().includes(q) || false;
        const matchNum = ord.orderNumber.toLowerCase().includes(q);
        const matchItems = ord.itemsSummary.some((item) => item.toLowerCase().includes(q));
        return matchName || matchPhone || matchAddr || matchNum || matchItems;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  // Counts for pills
  const totalActive = orders.filter((o) => o.status !== 'entregado').length;
  const waCount = orders.filter((o) => o.isWhatsApp && o.status !== 'entregado').length;
  const kitchenCount = orders.filter((o) => (o.status === 'en_horno' || o.status === 'pendiente_cocina')).length;
  const deliveryCount = orders.filter((o) => o.status === 'en_camino').length;

  // Pending dispatch sum
  const pendingDispatchTotal = orders
    .filter((o) => o.status !== 'entregado')
    .reduce((sum, o) => sum + o.total, 0);

  const handleNotifyWA = (order: Order) => {
    const rawPhone = order.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `¡Hola ${order.customerName}! 🥟 Tu pedido #${order.orderNumber.replace('#', '')} de Oven & Earth está en camino a ${order.address || 'tu domicilio'}. ¡Muchas gracias!`
    );
    if (rawPhone) {
      window.open(`https://wa.me/${rawPhone}?text=${msg}`, '_blank');
    }
    onShowToast(`💬 WhatsApp enviado: "Tu pedido está en camino 🛵"`);
  };

  const handleDispatch = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'en_camino');
    onShowToast('🛵 Asignado a cadete en calle');
  };

  const handleMoveToOven = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'en_horno');
    onShowToast('🔥 Comanda enviada al horno');
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-2">
      {/* Top Hero & Trigger */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-600 font-extrabold">
              Monitor de Turno
            </span>
            <h2 className="font-extrabold text-[24px] text-slate-900 leading-tight tracking-tight">
              Despacho &amp; WhatsApp
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] flex items-center gap-2 shadow-sm shadow-blue-200 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">add_comment</span>
            <span>+ Tomar Pedido WA</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full mt-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono o dirección..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs border border-slate-200 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 -mx-4 px-4 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg font-semibold text-[12px] shrink-0 transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Todos</span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalActive}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('whatsapp')}
          className={`flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg font-semibold text-[12px] shrink-0 transition-all cursor-pointer ${
            activeFilter === 'whatsapp'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>WhatsApp</span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              activeFilter === 'whatsapp' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {waCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('horno')}
          className={`flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg font-semibold text-[12px] shrink-0 transition-all cursor-pointer ${
            activeFilter === 'horno'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-amber-500">
            local_fire_department
          </span>
          <span>En Cocina</span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              activeFilter === 'horno' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {kitchenCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('delivery')}
          className={`flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg font-semibold text-[12px] shrink-0 transition-all cursor-pointer ${
            activeFilter === 'delivery'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-blue-500">
            two_wheeler
          </span>
          <span>En Camino</span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
              activeFilter === 'delivery' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {deliveryCount}
          </span>
        </button>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
            <span className="material-symbols-outlined text-slate-400 text-[40px]">inbox</span>
            <h4 className="font-bold text-[16px] text-slate-800 mt-2">No hay comandas que coincidan</h4>
            <p className="text-[13px] text-slate-500 mt-0.5">Prueba cambiando el filtro o agregando una nueva comanda.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3 relative transition-all duration-200 hover:shadow-md"
              >
                {/* Header of card: Customer, number, channel & status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {order.isWhatsApp ? (
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          chat
                        </span>
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-[16px] text-slate-800 truncate">
                          {order.customerName}
                        </h3>
                        <span className="text-[12px] text-slate-400 font-semibold">
                          {order.orderNumber}
                        </span>
                      </div>
                      {order.phone ? (
                        <a
                          href={`tel:${order.phone}`}
                          className="text-[12px] text-slate-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[13px]">phone</span>
                          {order.phone}
                        </a>
                      ) : (
                        <span className="text-[12px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">timer</span>
                          {order.pickupTime || 'Retiro en mostrador'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {order.status === 'en_camino' && (
                    <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-bold shrink-0">
                      <span className="material-symbols-outlined text-[14px]">two_wheeler</span>
                      <span>En Camino</span>
                    </span>
                  )}
                  {order.status === 'en_horno' && (
                    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[11px] font-bold shrink-0">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>En Horno</span>
                    </span>
                  )}
                  {order.status === 'pendiente_cocina' && (
                    <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold shrink-0">
                      <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                      <span>Pendiente</span>
                    </span>
                  )}
                  {order.status === 'entregado' && (
                    <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-bold shrink-0">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Entregado</span>
                    </span>
                  )}
                </div>

                {/* Delivery / Address box if delivery */}
                {order.isDelivery && order.address && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0">
                      {order.address.includes('Belgrano') ? 'home_pin' : 'location_on'}
                    </span>
                    <span className="text-[12px] font-medium truncate flex-1">
                      {order.address}
                    </span>
                    {order.motoAssignee && (
                      <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                        {order.motoAssignee}
                      </span>
                    )}
                    {order.deliveryEstimatedTime && (
                      <span className="text-[11px] text-amber-600 font-bold shrink-0">
                        {order.deliveryEstimatedTime}
                      </span>
                    )}
                  </div>
                )}

                {/* Items breakdown list */}
                <div className="space-y-1.5 py-0.5">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-start gap-2">
                      <span
                        className={`h-5 w-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          it.unitLabel === '1d' || it.unitLabel === '2d'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {it.unitLabel || `${it.quantity}u`}
                      </span>
                      <span className="text-[13px] text-slate-700 leading-snug">
                        {it.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment & Totals bottom section */}
                <div
                  className={`flex flex-col gap-2.5 -mx-4 -mb-4 p-4 rounded-b-2xl border-t ${
                    order.paymentStatus === 'COBRAR_EFECTIVO'
                      ? 'bg-amber-50/40 border-amber-100'
                      : 'bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[19px] text-slate-900 tracking-tight">
                          ${order.total.toLocaleString('es-AR')}
                        </span>
                        {order.paymentStatus === 'PAGADO' && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            PAGADO
                          </span>
                        )}
                        {order.paymentStatus === 'COBRAR_EFECTIVO' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">payments</span>
                            COBRAR EFECTIVO
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-slate-500 font-medium">
                        {order.paymentDetail || `${order.paymentMethod} • Turno noche`}
                      </span>
                    </div>

                    {/* Quick WhatsApp chat icon button if en camino */}
                    {order.status === 'en_camino' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleNotifyWA(order)}
                          className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
                          title="Abrir Chat de WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[19px]">chat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkDelivered(order.id)}
                          className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">
                            check_circle
                          </span>
                          <span>Entregado</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contextual Action Buttons for Horno or Mostrador */}
                  {order.status === 'en_horno' && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleNotifyWA(order)}
                        className="h-10 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px] text-emerald-600">send</span>
                        <span>Avisar Salida</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDispatch(order.id)}
                        className="h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer shadow-xs shadow-blue-100"
                      >
                        <span className="material-symbols-outlined text-[17px]">two_wheeler</span>
                        <span>Despachar</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'pendiente_cocina' && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveToOven(order.id)}
                        className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[12px] flex items-center gap-1.5 active:scale-95 transition-transform shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">skillet</span>
                        <span>Mover a Horno</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Queue Indicator */}
      <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-30 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl backdrop-blur-md border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[13px] font-semibold text-slate-200">
              {totalActive} Pedidos en cola activa
            </span>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-white">
            <span className="text-blue-400">${pendingDispatchTotal.toLocaleString('es-AR')}</span>
            <span className="text-[11px] text-slate-400 font-normal">
              por despachar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
