import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Order } from '../types';
import { OrderCardMobile } from '../components/OrderCardMobile';
import { OrderTableRowDesktop } from '../components/OrderTableRowDesktop';

interface ShiftedPageProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onNotifyCustomer: (order: Order) => void;
  onDeliverOrder: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  initialFilter?: string;
}

export const ShiftedPage: React.FC<ShiftedPageProps> = ({
  orders,
  onViewOrder,
  onNotifyCustomer,
  onDeliverOrder,
  onDeleteOrder,
  searchQuery,
  setSearchQuery,
  initialFilter = 'all'
}) => {
  const [courierFilter, setCourierFilter] = useState('All');
  const [notifyFilter, setNotifyFilter] = useState<string>(
    initialFilter === 'unnotified' ? 'unnotified' : 'all'
  );

  const shiftedOrders = orders.filter((o) => {
    if (o.status !== 'SHIFTED') return false;
    if (courierFilter !== 'All' && o.courier !== courierFilter) return false;
    if (notifyFilter === 'unnotified' && o.notification_sent) return false;
    if (notifyFilter === 'notified' && !o.notification_sent) return false;
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[var(--color-beige)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-charcoal)]">Shifted From Us</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[var(--color-plum)] text-xs font-bold border border-purple-200">
              📦 {shiftedOrders.length} Dispatched
            </span>
          </div>
          <p className="text-xs text-[var(--color-taupe)] font-medium mt-0.5">
            Orders dispatched from the shop pending customer notification & delivery
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[var(--color-beige)] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, tracking ID, or Order ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-beige)] bg-[var(--color-ivory)]/40 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
            <span className="font-semibold text-[var(--color-taupe)] shrink-0">Notification:</span>
            <button
              onClick={() => setNotifyFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 min-h-[36px] ${
                notifyFilter === 'all' ? 'bg-[var(--color-plum)] text-white' : 'bg-[var(--color-ivory)] text-[var(--color-charcoal)] border'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setNotifyFilter('unnotified')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 min-h-[36px] ${
                notifyFilter === 'unnotified' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              🔴 Not Notified
            </button>
            <button
              onClick={() => setNotifyFilter('notified')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 min-h-[36px] ${
                notifyFilter === 'notified' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              🟢 Notified
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
            <span className="font-semibold text-[var(--color-taupe)] shrink-0">Courier:</span>
            {['All', 'eKart', 'DTDC', 'Delhivery', 'India Post'].map((c) => (
              <button
                key={c}
                onClick={() => setCourierFilter(c)}
                className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 min-h-[36px] ${
                  courierFilter === c ? 'bg-[var(--color-plum)] text-white font-bold' : 'bg-gray-100 text-[var(--color-charcoal)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shiftedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-beige)] space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-purple-100 text-[var(--color-plum)] flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="font-bold text-base text-[var(--color-charcoal)]">No Shifted Orders Found</h3>
          <p className="text-xs text-[var(--color-taupe)] max-w-sm mx-auto">
            No dispatched orders match your filter criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {shiftedOrders.map((ord) => (
              <OrderCardMobile
                key={ord.id}
                order={ord}
                onViewDetails={onViewOrder}
                onNotifyCustomer={onNotifyCustomer}
                onDeliverOrder={onDeliverOrder}
                onDeleteOrder={onDeleteOrder}
              />
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-[var(--color-beige)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-beige)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-taupe)]">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status & Notification</th>
                    <th className="py-3 px-4">Courier & Tracking</th>
                    <th className="py-3 px-4">Dispatched Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftedOrders.map((ord) => (
                    <OrderTableRowDesktop
                      key={ord.id}
                      order={ord}
                      onViewDetails={onViewOrder}
                      onNotifyCustomer={onNotifyCustomer}
                      onDeliverOrder={onDeliverOrder}
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
