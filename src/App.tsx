/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OrdersScreen } from './components/OrdersScreen';
import { NewSaleScreen } from './components/NewSaleScreen';
import { ProductionScreen } from './components/ProductionScreen';
import { CashExpensesScreen } from './components/CashExpensesScreen';
import { WhatsAppImportModal } from './components/WhatsAppImportModal';
import { Toast } from './components/Toast';
import { INITIAL_ORDERS, INITIAL_EXPENSES, INITIAL_TANDAS } from './mockData';
import { Order, Expense, BatchTanda } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'pedidos' | 'nueva-venta' | 'produccion' | 'caja-gastos'>('pedidos');
  const [currentShift, setCurrentShift] = useState<string>('Turno Noche');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tandas, setTandas] = useState<BatchTanda[]>(INITIAL_TANDAS);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // New sales accumulators for Cash Screen
  const [addedCashSales, setAddedCashSales] = useState(0);
  const [addedDigitalSales, setAddedDigitalSales] = useState(0);
  const [addedSalesCount, setAddedSalesCount] = useState(0);

  // Production dynamic balance
  const [productionStats, setProductionStats] = useState({
    producidas: 360,
    vendidas: 240,
    enVitrina: 120,
    saladas: { producidas: 220, vendidas: 160, disponibles: 60 },
    dulces: { producidas: 60, vendidas: 35, disponibles: 25 },
    arabes: { producidas: 80, vendidas: 45, disponibles: 35 },
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('⚡ Conexión con WhatsApp y Cocina sincronizada');
    }, 900);
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update cash tracking
    if (newOrder.paymentMethod === 'Efectivo') {
      setAddedCashSales((prev) => prev + newOrder.total);
    } else {
      setAddedDigitalSales((prev) => prev + newOrder.total);
    }
    setAddedSalesCount((prev) => prev + 1);

    // Update production units sold
    let saladasSold = 0;
    let arabesSold = 0;
    let dulcesSold = 0;

    newOrder.items.forEach((it) => {
      if (it.category === 'saladas') saladasSold += it.quantity;
      if (it.category === 'arabes') arabesSold += it.quantity;
      if (it.category === 'dulces') dulcesSold += it.quantity;
    });

    const totalEmpanadasSold = saladasSold + arabesSold + dulcesSold;

    setProductionStats((prev) => {
      const newVendidas = prev.vendidas + totalEmpanadasSold;
      const newEnVitrina = Math.max(0, prev.enVitrina - totalEmpanadasSold);

      return {
        ...prev,
        vendidas: newVendidas,
        enVitrina: newEnVitrina,
        saladas: {
          ...prev.saladas,
          vendidas: prev.saladas.vendidas + saladasSold,
          disponibles: Math.max(0, prev.saladas.disponibles - saladasSold),
        },
        dulces: {
          ...prev.dulces,
          vendidas: prev.dulces.vendidas + dulcesSold,
          disponibles: Math.max(0, prev.dulces.disponibles - dulcesSold),
        },
        arabes: {
          ...prev.arabes,
          vendidas: prev.arabes.vendidas + arabesSold,
          disponibles: Math.max(0, prev.arabes.disponibles - arabesSold),
        },
      };
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleMarkDelivered = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'entregado' } : o))
    );
    showToast('✅ Pedido marcado como ENTREGADO');
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleAddTanda = (tanda: BatchTanda) => {
    setTandas((prev) => [tanda, ...prev]);
  };

  const handleUpdateProductionStats = (
    addedSaladas: number,
    addedDulces: number,
    addedArabes: number
  ) => {
    const batchTotal = addedSaladas + addedDulces + addedArabes;
    setProductionStats((prev) => ({
      ...prev,
      producidas: prev.producidas + batchTotal,
      enVitrina: prev.enVitrina + batchTotal,
      saladas: {
        ...prev.saladas,
        producidas: prev.saladas.producidas + addedSaladas,
        disponibles: prev.saladas.disponibles + addedSaladas,
      },
      dulces: {
        ...prev.dulces,
        producidas: prev.dulces.producidas + addedDulces,
        disponibles: prev.dulces.disponibles + addedDulces,
      },
      arabes: {
        ...prev.arabes,
        producidas: prev.arabes.producidas + addedArabes,
        disponibles: prev.arabes.disponibles + addedArabes,
      },
    }));
  };

  const activeOrdersCount = orders.filter((o) => o.status !== 'entregado').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Feedback */}
      <Toast message={toastMessage} />

      {/* Top Fixed Header */}
      <Header
        currentTab={currentTab}
        currentShift={currentShift}
        onShiftChange={setCurrentShift}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-20">
        {currentTab === 'pedidos' && (
          <OrdersScreen
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onMarkDelivered={handleMarkDelivered}
            onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'nueva-venta' && (
          <NewSaleScreen
            onCreateOrder={handleCreateOrder}
            onShowToast={showToast}
            onNavigateToOrders={() => setCurrentTab('pedidos')}
          />
        )}

        {currentTab === 'produccion' && (
          <ProductionScreen
            currentShift={currentShift}
            onShiftChange={setCurrentShift}
            tandas={tandas}
            onAddTanda={handleAddTanda}
            onShowToast={showToast}
            productionStats={productionStats}
            onUpdateProductionStats={handleUpdateProductionStats}
          />
        )}

        {currentTab === 'caja-gastos' && (
          <CashExpensesScreen
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onShowToast={showToast}
            totalSalesCash={addedCashSales}
            totalSalesDigital={addedDigitalSales}
            orderCount={addedSalesCount}
          />
        )}
      </main>

      {/* WhatsApp Raw Text Import Modal */}
      <WhatsAppImportModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onImportOrder={handleCreateOrder}
      />

      {/* Bottom Sticky Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeOrdersCount={activeOrdersCount}
      />
    </div>
  );
}
