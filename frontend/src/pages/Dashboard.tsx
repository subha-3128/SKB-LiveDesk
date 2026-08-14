import React from 'react';
import { ShoppingBag, Truck, CheckCircle2, Calendar, Plus, Search, ArrowRight } from 'lucide-react';
import type { DashboardStats, NeedsAttentionItem, Order } from '../types';
import { NeedsAttentionBanner } from '../components/NeedsAttentionBanner';
import { OrderCardMobile } from '../components/OrderCardMobile';
import { OrderTableRowDesktop } from '../components/OrderTableRowDesktop';

interface DashboardProps {
  stats?: DashboardStats;
  attentionItems: NeedsAttentionItem[];
  recentOrders: Order[];
  onOpenAddModal: () => void;
  onViewOrder: (order: Order) => void;
  onShiftOrder: (order: Order) => void;
  onDeliverOrder?: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  onNavigateTab: (tab: string, filter?: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  attentionItems,
  recentOrders,
  onOpenAddModal,
  onViewOrder,
  onShiftOrder,
  onDeliverOrder,
  onDeleteOrder,
  onNavigateTab,
  searchQuery,
  setSearchQuery
}) => {
  const getKolkataDateString = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const statCards = [
    {
      title: 'New Orders',
      value: stats?.new_orders ?? 0,
      icon: ShoppingBag,
      color: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/30',
      badgeColor: 'bg-[var(--color-warning)] text-white',
      tab: 'orders'
    },
    {
      title: 'Shifted Orders',
      value: stats?.shifted_orders ?? 0,
      icon: Truck,
      color: 'bg-purple-50 text-[var(--color-plum)] border-purple-200',
      badgeColor: 'bg-[var(--color-plum)] text-white',
      tab: 'shifted'
    },
    {
      title: 'Delivered Orders',
      value: stats?.delivered_orders ?? 0,
      icon: CheckCircle2,
      color: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/30',
      badgeColor: 'bg-[var(--color-success)] text-white',
      tab: 'delivered'
    },
    {
      title: "Today's Orders",
      value: stats?.todays_orders ?? 0,
      icon: Calendar,
      color: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/30',
      badgeColor: 'bg-[var(--color-info)] text-white',
      tab: 'orders'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* SHOP HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-plum)]">Bepari &amp; Brothers</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-rose-light)] text-[var(--color-plum)] text-xs font-bold">
              Live Selling
            </span>
          </div>
          <p className="text-xs text-[var(--color-taupe)] font-medium mt-1">
            📅 {getKolkataDateString()} • Post-receiving Order Management System
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="py-3 px-5 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow active:scale-[0.99] shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Order</span>
        </button>
      </div>

      {/* NEEDS ATTENTION ALERTS */}
      <NeedsAttentionBanner
        items={attentionItems}
        onAction={(type) => {
          if (type === 'UNNOTIFIED') {
            onNavigateTab('shifted', 'unnotified');
          } else if (type === 'READY_TO_SHIFT') {
            onNavigateTab('orders');
          } else if (type === 'MISSING_TRACKING') {
            onNavigateTab('shifted');
          }
        }}
      />

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className="glass-card p-4.5 rounded-2xl cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-taupe)]">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[var(--color-charcoal)]">{card.value}</span>
                <span className="text-[10px] font-bold text-[var(--color-plum)] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT ORDERS TABLE SECTION */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h2 className="text-base font-bold text-[var(--color-charcoal)]">Recent Orders</h2>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[var(--color-plum)] hover:underline sm:hidden"
            >
              View All →
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by customer, phone, SKU or Order ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-beige)] bg-[var(--color-ivory)]/40 text-xs font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
              />
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-[var(--color-plum)] hover:underline shrink-0"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-ivory)] text-[var(--color-taupe)] flex items-center justify-center mx-auto text-xl">
              📦
            </div>
            <h3 className="font-bold text-sm text-[var(--color-charcoal)]">No Orders Found</h3>
            <p className="text-xs text-[var(--color-taupe)] max-w-xs mx-auto">
              No orders matched your search query or no orders have been recorded yet.
            </p>
            <button
              onClick={onOpenAddModal}
              className="py-2 px-4 rounded-xl bg-[var(--color-plum)] text-white font-bold text-xs inline-flex items-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Order</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {recentOrders.slice(0, 10).map((ord) => (
                <OrderCardMobile
                  key={ord.id}
                  order={ord}
                  onViewDetails={onViewOrder}
                  onShiftOrder={onShiftOrder}
                  onDeliverOrder={onDeliverOrder}
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
                      <th className="py-3 px-4">Courier & Tracking</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 10).map((ord) => (
                      <OrderTableRowDesktop
                        key={ord.id}
                        order={ord}
                        onViewDetails={onViewOrder}
                        onShiftOrder={onShiftOrder}
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
    </div>
  );
};
