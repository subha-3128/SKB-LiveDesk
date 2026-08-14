import React from 'react';
import { Search } from 'lucide-react';
import type { Order } from '../types';
import { OrderCardMobile } from '../components/OrderCardMobile';
import { OrderTableRowDesktop } from '../components/OrderTableRowDesktop';

interface DeliveredPageProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const DeliveredPage: React.FC<DeliveredPageProps> = ({
  orders,
  onViewOrder,
  onDeleteOrder,
  searchQuery,
  setSearchQuery
}) => {
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[var(--color-beige)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-charcoal)]">Delivered Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] text-xs font-bold border border-[var(--color-success)]/30">
              ✓ {deliveredOrders.length} Delivered
            </span>
          </div>
          <p className="text-xs text-[var(--color-taupe)] font-medium mt-0.5">
            Completed orders delivered to customers
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[var(--color-beige)] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search delivered orders by customer name, phone number, tracking ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-beige)] bg-[var(--color-ivory)]/40 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
          />
        </div>
      </div>

      {deliveredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-beige)] space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h3 className="font-bold text-base text-[var(--color-charcoal)]">No Delivered Orders Yet</h3>
          <p className="text-xs text-[var(--color-taupe)] max-w-sm mx-auto">
            Once shifted orders are confirmed delivered, they will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {deliveredOrders.map((ord) => (
              <OrderCardMobile
                key={ord.id}
                order={ord}
                onViewDetails={onViewOrder}
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
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Courier & Tracking</th>
                    <th className="py-3 px-4">Delivery Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map((ord) => (
                    <OrderTableRowDesktop
                      key={ord.id}
                      order={ord}
                      onViewDetails={onViewOrder}
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
