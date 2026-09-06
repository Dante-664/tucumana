import React, { useState, useMemo } from 'react';
import { Order, OrderItem } from '../types';
import { PRODUCT_CATALOG } from '../mockData';

interface NewSaleScreenProps {
  onCreateOrder: (order: Order) => void;
  onShowToast: (msg: string) => void;
  onNavigateToOrders: () => void;
}

export const NewSaleScreen: React.FC<NewSaleScreenProps> = ({
  onCreateOrder,
  onShowToast,
  onNavigateToOrders,
}) => {
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Target dozen
  const [targetUnits, setTargetUnits] = useState<number>(24);

  // Cart quantities map: productId -> quantity
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({
    'prod-carne-suave': 0,
    'prod-carne-picante': 0,
    'prod-jamon-queso': 0,
    'prod-pollo': 0,
    'prod-verdura': 0,
    'prod-sfijas': 0,
    'prod-membrillo': 0,
    'prod-batata': 0,
    'prod-coca': 0,
    'prod-sprite': 0,
    'prod-agua': 0,
    'prod-cerveza': 0,
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Mercado Pago'>('Efectivo');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Adjust item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCartQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Calculations
  const empanadaCategories = ['saladas', 'arabes', 'dulces'];
  const totalEmpanadas = useMemo(() => {
    return PRODUCT_CATALOG.filter((p) => empanadaCategories.includes(p.category)).reduce(
      (sum, p) => sum + (cartQuantities[p.id] || 0),
      0
    );
  }, [cartQuantities]);

  const saladasCount = useMemo(() => {
    return PRODUCT_CATALOG.filter((p) => p.category === 'saladas').reduce(
      (sum, p) => sum + (cartQuantities[p.id] || 0),
      0
    );
  }, [cartQuantities]);

  const arabesCount = useMemo(() => {
    return PRODUCT_CATALOG.filter((p) => p.category === 'arabes').reduce(
      (sum, p) => sum + (cartQuantities[p.id] || 0),
      0
    );
  }, [cartQuantities]);

  const dulcesCount = useMemo(() => {
    return PRODUCT_CATALOG.filter((p) => p.category === 'dulces').reduce(
      (sum, p) => sum + (cartQuantities[p.id] || 0),
      0
    );
  }, [cartQuantities]);

  const bebidasCount = useMemo(() => {
    return PRODUCT_CATALOG.filter((p) => p.category === 'bebidas').reduce(
      (sum, p) => sum + (cartQuantities[p.id] || 0),
      0
    );
  }, [cartQuantities]);

  const subtotal = useMemo(() => {
    return PRODUCT_CATALOG.reduce((sum, p) => {
      const qty = cartQuantities[p.id] || 0;
      return sum + qty * p.price;
    }, 0);
  }, [cartQuantities]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Submit sale
  const handleRegisterSale = () => {
    if (totalEmpanadas === 0 && bebidasCount === 0) {
      onShowToast('Selecciona al menos 1 empanada o bebida');
      return;
    }

    const orderItems: OrderItem[] = [];
    const itemsSummary: string[] = [];

    // Group items for clear ticket view
    PRODUCT_CATALOG.forEach((p) => {
      const qty = cartQuantities[p.id] || 0;
      if (qty > 0) {
        let unitLabel = `${qty}u`;
        if (qty === 12) unitLabel = '1d';
        else if (qty === 6) unitLabel = '½d';
        else if (qty === 24) unitLabel = '2d';
        else if (p.category === 'bebidas') unitLabel = `${qty}x`;

        orderItems.push({
          id: `item-${Date.now()}-${p.id}`,
          name: `${p.name} (${p.description})`,
          quantity: qty,
          unitLabel,
          unitPrice: p.price * qty,
          category: p.category,
        });

        itemsSummary.push(`${unitLabel} ${p.name}`);
      }
    });

    const nextOrderNum = `#${String(Math.floor(92 + Math.random() * 20)).padStart(3, '0')}`;
    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      orderNumber: nextOrderNum,
      customerName: customerName.trim() || 'Venta Mostrador',
      phone: customerPhone.trim() || '',
      isDelivery,
      address: isDelivery ? deliveryAddress.trim() || 'Dirección no especificada' : undefined,
      pickupTime: !isDelivery ? 'Entrega inmediata en caja' : undefined,
      deliveryEstimatedTime: isDelivery ? 'Sale en 25 min' : undefined,
      motoAssignee: isDelivery ? 'Cadete asignado' : undefined,
      items: orderItems,
      itemsSummary,
      total: grandTotal,
      paymentStatus: paymentMethod === 'Efectivo' ? 'PAGADO' : 'PAGADO',
      paymentMethod,
      paymentDetail: isDelivery
        ? `Envío a domicilio • ${paymentMethod}`
        : `Venta Mostrador • ${paymentMethod}`,
      status: 'en_horno',
      isWhatsApp: Boolean(customerPhone.trim()),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onCreateOrder(newOrder);
    onShowToast(`🎉 ¡Venta registrada! Comanda ${nextOrderNum}`);

    // Reset fields
    setCustomerName('');
    setCustomerPhone('');
    setIsDelivery(false);
    setDeliveryAddress('');
    setCartQuantities({
      'prod-carne-suave': 0,
      'prod-carne-picante': 0,
      'prod-jamon-queso': 0,
      'prod-pollo': 0,
      'prod-verdura': 0,
      'prod-sfijas': 0,
      'prod-membrillo': 0,
      'prod-batata': 0,
      'prod-coca': 0,
      'prod-sprite': 0,
      'prod-agua': 0,
      'prod-cerveza': 0,
    });
    setDiscountAmount(0);

    // Navigate to active orders
    onNavigateToOrders();
  };

  return (
    <div className="flex flex-col gap-4 pb-36 pt-2">
      {/* Top Bar Indicator */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[13px] font-bold text-slate-800">Mostrador • Pedido en vivo</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Auto-Sync ON
        </span>
      </div>

      {/* Section 1: Customer Data */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              contact_page
            </span>
            <h3 className="font-bold text-[16px] text-slate-800">Datos del Cliente</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            Rápido POS
          </span>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nombre y Apellido
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                badge
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej: Carlos Gómez"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 text-slate-800 text-[14px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none border border-slate-200 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Teléfono / WhatsApp
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                smartphone
              </span>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej: 11 3456 7890"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 text-slate-800 text-[14px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none border border-slate-200 transition-all"
              />
            </div>
          </div>

          {/* Delivery Checkbox */}
          <div className="pt-1">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-slate-800">Envío por Delivery</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Despacho moto propio / cadetería
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isDelivery}
                onChange={(e) => setIsDelivery(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </label>

            {isDelivery && (
              <div className="mt-2.5 animate-in fade-in">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Dirección de Entrega
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    location_on
                  </span>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ej: Av. Santa Fe 3200, Piso 3 Depto B"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 text-slate-800 text-[14px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none border border-slate-200 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Objetivo de Docenas */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">
              target
            </span>
            <h3 className="font-bold text-[16px] text-slate-800">Objetivo de Docenas</h3>
          </div>
          <span className="text-[12px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
            Objetivo: {targetUnits} un.
          </span>
        </div>
        <p className="text-[12px] text-slate-500">
          Toca un atajo para prefijar la cantidad del lote o arma a medida:
        </p>

        {/* 4 preset buttons */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Media Docena', count: 6 },
            { label: '1 Docena', count: 12 },
            { label: '1.5 Docenas', count: 18 },
            { label: '2 Docenas', count: 24 },
          ].map((preset) => {
            const isSelected = targetUnits === preset.count;
            return (
              <button
                key={preset.count}
                type="button"
                onClick={() => setTargetUnits(preset.count)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-[13px]">{preset.label}</span>
                <span
                  className={`text-[15px] font-extrabold ${
                    isSelected ? 'text-white' : 'text-blue-600'
                  }`}
                >
                  {preset.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress Tracker */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[12px] font-semibold mb-1">
            <span className="text-slate-500">Empanadas cargadas:</span>
            <span
              className={`font-extrabold ${
                totalEmpanadas === targetUnits
                  ? 'text-emerald-600'
                  : totalEmpanadas > targetUnits
                  ? 'text-rose-600'
                  : 'text-blue-600'
              }`}
            >
              {totalEmpanadas} / {targetUnits} un.
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                totalEmpanadas === targetUnits
                  ? 'bg-emerald-500'
                  : totalEmpanadas > targetUnits
                  ? 'bg-rose-500'
                  : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.min(100, (totalEmpanadas / (targetUnits || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Section 3: Flavors & Catalog */}
      <div className="space-y-4">
        {/* Category 1: Saladas Tradicionales */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h4 className="font-bold text-[15px] text-slate-800">Saladas Tradicionales</h4>
            </div>
            <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              $900 c/u
            </span>
          </div>

          <div className="space-y-3">
            {PRODUCT_CATALOG.filter((p) => p.category === 'saladas').map((p) => {
              const qty = cartQuantities[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                      {p.tag && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400 truncate leading-tight mt-0.5">
                      {p.description}
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-9 text-center font-extrabold text-[15px] text-slate-900 tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(p.id, 1)}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Category 2: Especialidades Árabes */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="font-bold text-[15px] text-slate-800">Especialidades Árabes</h4>
            </div>
            <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              $950 c/u
            </span>
          </div>

          <div className="space-y-3">
            {PRODUCT_CATALOG.filter((p) => p.category === 'arabes').map((p) => {
              const qty = cartQuantities[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                      {p.badge && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400 truncate leading-tight mt-0.5">
                      {p.description}
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-9 text-center font-extrabold text-[15px] text-slate-900 tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(p.id, 1)}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Category 3: Dulces de Horno */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <h4 className="font-bold text-[15px] text-slate-800">Dulces de Horno</h4>
            </div>
            <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              $850 c/u
            </span>
          </div>

          <div className="space-y-3">
            {PRODUCT_CATALOG.filter((p) => p.category === 'dulces').map((p) => {
              const qty = cartQuantities[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                      {p.tag && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded">
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400 truncate leading-tight mt-0.5">
                      {p.description}
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-9 text-center font-extrabold text-[15px] text-slate-900 tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(p.id, 1)}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Category 4: Bebidas y Gaseosas */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">
                local_bar
              </span>
              <h4 className="font-bold text-[15px] text-slate-800">Bebidas y Gaseosas</h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Toque rápido</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_CATALOG.filter((p) => p.category === 'bebidas').map((b) => {
              const qty = cartQuantities[b.id] || 0;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => updateQuantity(b.id, 1)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    qty > 0
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      {b.name.includes('Coca') || b.name.includes('Sprite')
                        ? 'local_cafe'
                        : b.name.includes('Agua')
                        ? 'water_drop'
                        : 'sports_bar'}
                    </span>
                    {qty > 0 && (
                      <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[12px] font-extrabold flex items-center justify-center shadow-xs">
                        {qty}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="font-bold text-[13px] text-slate-800 truncate">{b.name}</div>
                    <div className="text-[12px] font-semibold text-blue-600">
                      +${b.price.toLocaleString('es-AR')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 4: Payment Method */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">
                payments
              </span>
              <h3 className="font-bold text-[16px] text-slate-800">Método de Pago</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Cobro de caja</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('Efectivo')}
              className={`h-11 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                paymentMethod === 'Efectivo'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Efectivo</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Transferencia')}
              className={`h-11 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                paymentMethod === 'Transferencia'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
              <span>Transferencia</span>
            </button>
          </div>

          {/* Discount / Manual adjustment */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Total Manual / Descuento ($)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
              placeholder="0 (Descuento o ajuste)"
              className="w-full h-11 px-3 rounded-xl bg-slate-50 text-slate-800 text-[14px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none border border-slate-200"
            />
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar Checkout */}
      <div className="fixed bottom-20 inset-x-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3.5 shadow-xl max-w-xl mx-auto">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2 px-1">
          <div className="flex items-center gap-1.5 truncate">
            <span>{saladasCount} Sal.</span>
            <span>•</span>
            <span>{arabesCount} Ár.</span>
            <span>•</span>
            <span>{dulcesCount} Dul.</span>
            {bebidasCount > 0 && (
              <>
                <span>•</span>
                <span>{bebidasCount} Beb.</span>
              </>
            )}
          </div>
          <span className="text-blue-600 font-bold">
            Total: {totalEmpanadas} empanadas
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Calculado
            </span>
            <span className="font-extrabold text-[22px] text-slate-900 tracking-tight truncate">
              ${grandTotal.toLocaleString('es-AR')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRegisterSale}
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            <span>Registrar Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
