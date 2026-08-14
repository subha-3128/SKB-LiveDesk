import React from 'react';
import { LayoutDashboard, ShoppingBag, Truck, CheckCircle2, Users, Receipt, Settings, Plus, LogOut } from 'lucide-react';
import type { DashboardStats } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats?: DashboardStats;
  onOpenAddModal: () => void;
  onLogout: () => void;
  staffName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onOpenAddModal,
  onLogout,
  staffName = 'Shop Staff'
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: stats?.new_orders },
    { id: 'shifted', label: 'Shifted', icon: Truck, badge: stats?.shifted_orders },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'billing', label: 'Billing', icon: Receipt },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-surface)] border-r border-[var(--color-beige)] min-h-screen fixed left-0 top-0 z-30 shadow-xs">
        <div className="p-5 border-b border-[var(--color-beige)] bg-gradient-to-b from-[var(--color-rose-light)]/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-plum)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              BB
            </div>
            <div>
              <h1 className="font-bold text-base text-[var(--color-plum)] leading-tight">Bepari &amp; Brothers</h1>
              <p className="text-xs text-[var(--color-taupe)] font-medium">Garments Live Manager</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={onOpenAddModal}
            className="w-full py-3 px-4 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.99] min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add Order</span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-[var(--color-plum)] text-white shadow-xs'
                    : 'text-[var(--color-charcoal)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-plum)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--color-taupe)]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--color-rose-light)] text-[var(--color-plum)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--color-beige)] space-y-1 bg-[var(--color-ivory)]/50">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
              activeTab === 'settings'
                ? 'bg-[var(--color-plum)] text-white'
                : 'text-[var(--color-charcoal)] hover:bg-white text-[var(--color-taupe)]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>

          <div className="pt-2 border-t border-[var(--color-beige)]/60 flex items-center justify-between px-3 py-1">
            <div className="text-xs">
              <p className="font-semibold text-[var(--color-charcoal)]">{staffName}</p>
              <p className="text-[var(--color-taupe)] text-[11px]">Shop Owner / Staff</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-[var(--color-taupe)] hover:text-[var(--color-danger)] rounded-lg hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-beige)] z-30 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-plum)] text-white flex items-center justify-center font-black text-xs shrink-0">
            BB
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-xs text-[var(--color-plum)] leading-tight">Bepari &amp; Brothers</h1>
            <p className="text-[10px] text-[var(--color-taupe)] font-medium">Live Stream Order Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="py-1.5 px-3 rounded-lg bg-[var(--color-plum)] text-white text-xs font-bold flex items-center gap-1 shadow-xs min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Order</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-lg text-[var(--color-taupe)] hover:bg-gray-100 min-h-[36px]"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-beige)] z-40 px-2 py-1 flex items-center justify-around shadow-lg min-h-[58px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors min-h-[48px] relative ${
                isActive ? 'text-[var(--color-plum)] font-bold' : 'text-[var(--color-taupe)] font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-plum)]' : 'text-[var(--color-taupe)]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[var(--color-plum)] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
