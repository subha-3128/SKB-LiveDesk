import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingBag, Eye, ArrowLeft } from 'lucide-react';
import type { Customer, CustomerProfile, Order } from '../types';
import { apiService } from '../services/api';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { StatusBadge } from '../components/StatusBadge';

interface CustomersPageProps {
  onViewOrder: (order: Order) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onViewOrder,
  searchQuery,
  setSearchQuery
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    apiService.getCustomers(searchQuery)
      .then((data) => setCustomers(data));
  }, [searchQuery]);

  const handleSelectCustomer = (id: number) => {
    setSelectedCustomerId(id);
    apiService.getCustomerProfile(id).then((data) => setProfileData(data));
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[var(--color-beige)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-charcoal)]">Customer Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-rose-light)] text-[var(--color-plum)] text-xs font-bold">
              {customers.length} Customers
            </span>
          </div>
          <p className="text-xs text-[var(--color-taupe)] font-medium mt-0.5">
            Search customer purchase history & repeat buyers
          </p>
        </div>
      </div>

      {selectedCustomerId && profileData ? (
        <div className="space-y-6 animate-fade-in">
          <button
            onClick={() => { setSelectedCustomerId(null); setProfileData(null); }}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-plum)] hover:underline py-2 px-3 rounded-xl bg-white border border-[var(--color-beige)] shadow-2xs min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Customers</span>
          </button>

          <div className="bg-white p-6 rounded-2xl border border-[var(--color-beige)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-beige)] pb-4">
              <div>
                <h2 className="text-2xl font-black text-[var(--color-charcoal)]">{profileData.customer.name}</h2>
                <p className="text-xs text-[var(--color-taupe)] font-medium mt-0.5">{profileData.customer.display_phone}</p>
              </div>
              <WhatsAppButton phone={profileData.customer.whatsapp_phone || profileData.customer.phone} size="lg" />
            </div>

            <div className="text-xs text-[var(--color-charcoal)] flex items-start gap-2 bg-[var(--color-ivory)] p-3 rounded-xl border border-[var(--color-beige)]">
              <MapPin className="w-4 h-4 text-[var(--color-taupe)] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{profileData.customer.address}</p>
                {(profileData.customer.city || profileData.customer.state || profileData.customer.pincode) && (
                  <p className="text-[var(--color-taupe)] mt-0.5">
                    {[profileData.customer.landmark, profileData.customer.city, profileData.customer.state, profileData.customer.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[var(--color-ivory)] p-3.5 rounded-xl border text-center">
                <span className="text-xs text-[var(--color-taupe)] font-medium block">Total Orders</span>
                <span className="text-2xl font-black text-[var(--color-plum)]">{profileData.customer.total_orders}</span>
              </div>
              <div className="bg-[var(--color-success-bg)] p-3.5 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-[var(--color-success)] font-medium block">Delivered</span>
                <span className="text-2xl font-black text-[var(--color-success)]">{profileData.customer.delivered_orders}</span>
              </div>
              <div className="bg-[var(--color-warning-bg)] p-3.5 rounded-xl border border-amber-200 text-center">
                <span className="text-xs text-[var(--color-warning)] font-medium block">Active</span>
                <span className="text-2xl font-black text-[var(--color-warning)]">{profileData.customer.active_orders}</span>
              </div>
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-center">
                <span className="text-xs text-[var(--color-plum)] font-medium block">Total Purchase</span>
                <span className="text-2xl font-black text-[var(--color-plum)]">₹{profileData.customer.total_spent.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[var(--color-beige)] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[var(--color-charcoal)] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--color-plum)]" />
              <span>Order History</span>
            </h3>

            <div className="space-y-3">
              {profileData.orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onViewOrder(ord)}
                  className="p-4 rounded-xl border border-[var(--color-beige)] bg-[var(--color-ivory)]/40 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--color-plum)]">{ord.order_number}</span>
                      <StatusBadge status={ord.status} />
                      <span className="text-xs text-[var(--color-taupe)]">({ord.source})</span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--color-charcoal)]">{ord.product_name}</p>
                    <p className="text-[11px] text-[var(--color-taupe)]">
                      {ord.size} • {ord.colour} • Qty {ord.quantity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-base font-black text-[var(--color-plum)]">₹{ord.total_amount.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-[var(--color-taupe)] block">
                        {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[var(--color-charcoal)] text-xs font-semibold">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[var(--color-beige)] shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer by name or phone number (e.g. 9876543210)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-beige)] bg-[var(--color-ivory)]/40 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectCustomer(c.id)}
                className="bg-white p-4 rounded-2xl border border-[var(--color-beige)] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--color-charcoal)]">{c.name}</h3>
                  <p className="text-xs text-[var(--color-taupe)] font-medium">{c.display_phone || c.phone}</p>
                  <p className="text-[11px] text-[var(--color-taupe)] truncate max-w-xs">{c.address}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-rose-light)] text-[var(--color-plum)] text-xs font-bold block">
                    {c.order_count} Orders
                  </span>
                  <span className="text-xs font-black text-[var(--color-plum)] block">
                    ₹{(c.total_spent || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
