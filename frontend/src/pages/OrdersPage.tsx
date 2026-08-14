import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import type { Order } from '../types';
import { OrderCardMobile } from '../components/OrderCardMobile';
import { OrderTableRowDesktop } from '../components/OrderTableRowDesktop';

interface OrdersPageProps {
  orders: Order[];
  onOpenAddModal: () => void;
  onViewOrder: (order: Order) => void;
  onShiftOrder: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onOpenAddModal,
  onViewOrder,
  onShiftOrder,
  onDeleteOrder,
  searchQuery,
  setSearchQuery
}) => {
  const [sourceFilter, setSourceFilter] = useState('All');

  const newOrders = orders.filter((o) => {
    if (o.status !== 'NEW') return false;
    if (sourceFilter !== 'All' && o.source !== sourceFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-charcoal)]">New Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)] text-xs font-bold border border-[var(--color-warning)]/30">
              {newOrders.length} Waiting
            </span>
          </div>
          <p className="text-xs text-[var(--color-taupe)] font-medium mt-0.5">
            Orders received from live streams waiting to be packed & shifted
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="py-2.5 px-4 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Order</span>
        </button>
      </div>

      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number or Order ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-beige)] bg-[var(--color-ivory)]/40 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="font-semibold text-[var(--color-taupe)] flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Source:
          </span>
          {['All', 'Instagram Live', 'Facebook Live', 'WhatsApp', 'Other'].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all min-h-[36px] ${
                sourceFilter === src
                  ? 'bg-[var(--color-plum)] text-white shadow-xs'
                  : 'bg-[var(--color-ivory)] text-[var(--color-charcoal)] border border-[var(--color-beige)] hover:border-gray-300'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {newOrders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[var(--color-rose-light)] text-[var(--color-plum)] flex items-center justify-center mx-auto text-2xl">
            🛍️
          </div>
          <h3 className="font-bold text-base text-[var(--color-charcoal)]">No New Orders Pending</h3>
          <p className="text-xs text-[var(--color-taupe)] max-w-sm mx-auto">
            You're all caught up! 🎉 New orders created during live streams will appear here waiting to be shifted.
          </p>
          <button
            onClick={onOpenAddModal}
            className="py-2.5 px-4 rounded-xl bg-[var(--color-plum)] text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Order Now</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {newOrders.map((ord) => (
              <OrderCardMobile
                key={ord.id}
                order={ord}
                onViewDetails={onViewOrder}
                onShiftOrder={onShiftOrder}
                onDeleteOrder={onDeleteOrder}
              />
            ))}
          </div>

          <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-beige)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-taupe)]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Courier</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newOrders.map((ord) => (
                    <OrderTableRowDesktop
                      key={ord.id}
                      order={ord}
                      onViewDetails={onViewOrder}
                      onShiftOrder={onShiftOrder}
                      onDeleteOrder={onDeleteOrder}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
