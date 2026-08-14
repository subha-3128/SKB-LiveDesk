import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, ShoppingBag, Truck, Bell, CheckCircle2, MapPin, FileText, Trash2 } from 'lucide-react';
import type { Order } from '../types';
import { apiService } from '../services/api';
import { StatusBadge, NotificationBadge } from '../components/StatusBadge';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { OrderTimeline } from '../components/OrderTimeline';

interface OrderDetailsPageProps {
  orderId: number;
  onBack: () => void;
  onShiftOrder: (order: Order) => void;
  onNotifyCustomer: (order: Order) => void;
  onDeliverOrder: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  orderId,
  onBack,
  onShiftOrder,
  onNotifyCustomer,
  onDeliverOrder,
  onDeleteOrder
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    apiService.getOrderById(orderId)
      .then((data) => setOrder(data))
      .catch(() => setError('Order not found'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--color-taupe)]">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 bg-white rounded-2xl border text-center space-y-3">
        <p className="text-sm font-bold text-red-600">Failed to load order</p>
        <button onClick={onBack} className="px-4 py-2 bg-[var(--color-plum)] text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Pending';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* TOP NAV BAR */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="py-2 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[var(--color-charcoal)] hover:bg-gray-50 flex items-center gap-2 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <div className="flex items-center gap-2">
          {order.status === 'NEW' && (
            <button
              onClick={() => onShiftOrder(order)}
              className="py-2.5 px-4 rounded-xl bg-[var(--color-plum)] text-white text-xs font-bold flex items-center gap-2 shadow-sm min-h-[44px]"
            >
              <Truck className="w-4 h-4" />
              <span>✓ Shift Order</span>
            </button>
          )}

          {order.status === 'SHIFTED' && (
            <>
              <button
                onClick={() => onNotifyCustomer(order)}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm min-h-[44px]"
              >
                <Bell className="w-4 h-4" />
                <span>Notify Customer</span>
              </button>

              <button
                onClick={() => onDeliverOrder(order)}
                className="py-2.5 px-3.5 rounded-xl bg-[var(--color-plum)] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Delivered</span>
              </button>
            </>
          )}

          {onDeleteOrder && (
            <button
              onClick={() => onDeleteOrder(order)}
              className="py-2.5 px-3.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white p-6 rounded-2xl border border-[var(--color-beige)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-beige)] pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[var(--color-plum)]">{order.order_number}</h1>
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--color-ivory)] border text-xs font-bold text-[var(--color-taupe)]">
                Source: {order.source}
              </span>
            </div>
            <p className="text-xs text-[var(--color-taupe)] font-medium mt-1">
              Created on {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            {order.status === 'SHIFTED' && (
              <NotificationBadge notified={order.notification_sent} />
            )}
          </div>
        </div>

        {/* COURIER & TRACKING CARD (IF DISPATCHED) */}
        {order.courier && order.tracking_number && (
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[var(--color-plum)] text-sm">{order.courier}</p>
                <p className="font-mono text-xs text-[var(--color-taupe)] mt-0.5">Tracking ID: {order.tracking_number}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] text-[var(--color-taupe)]">Dispatched Date</p>
              <p className="font-bold text-[var(--color-charcoal)]">{formatDate(order.shipping_date)}</p>
            </div>
          </div>
        )}

        {/* GRID: CUSTOMER INFO & ORDER DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* CUSTOMER CARD */}
          <div className="bg-[var(--color-ivory)]/60 p-4.5 rounded-xl border border-[var(--color-beige)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-beige)] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-taupe)] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[var(--color-plum)]" /> Customer Information
              </h3>
              <WhatsAppButton phone={order.whatsapp_phone || order.phone} size="sm" />
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-sm text-[var(--color-charcoal)]">{order.customer_name}</p>
              <p className="text-[var(--color-taupe)] font-semibold">Phone: {order.display_phone || order.phone}</p>
              {order.whatsapp_phone && order.whatsapp_phone !== order.phone && (
                <p className="text-emerald-700 font-semibold">WhatsApp: {order.whatsapp_phone}</p>
              )}
              
              <div className="pt-2 border-t border-[var(--color-beige)] text-[11px] text-[var(--color-taupe)] space-y-0.5">
                <p className="font-semibold text-[var(--color-charcoal)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-plum)] shrink-0" /> Delivery Address:
                </p>
                <p className="pl-4 text-[var(--color-charcoal)]">{order.address}</p>
                {order.landmark && <p className="pl-4 italic">Landmark: {order.landmark}</p>}
                {(order.city || order.state || order.pincode) && (
                  <p className="pl-4 font-medium">
                    {[order.city, order.state, order.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ITEM SUMMARY */}
          <div className="bg-[var(--color-ivory)]/60 p-4.5 rounded-xl border border-[var(--color-beige)] space-y-3">
            <div className="border-b border-[var(--color-beige)] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-taupe)] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[var(--color-plum)]" /> Order Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-[var(--color-charcoal)]">{order.product_name}</p>
                  <p className="text-[var(--color-taupe)] text-[11px]">
                    Size: <span className="font-bold text-[var(--color-plum)]">{order.size}</span> | Colour: {order.colour}
                  </p>
                  {order.product_sku && (
                    <p className="text-[10px] text-[var(--color-taupe)] font-mono">SKU: {order.product_sku}</p>
                  )}
                </div>
                <p className="font-bold text-xs text-[var(--color-taupe)]">Qty: {order.quantity}</p>
              </div>

              <div className="pt-3 border-t border-[var(--color-beige)] flex justify-between items-center text-sm">
                <span className="font-bold text-[var(--color-charcoal)]">Total Price</span>
                <span className="text-xl font-black text-[var(--color-plum)]">₹{(order.total_amount ?? 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTES SECTION */}
        {(order.customer_notes || order.internal_notes) && (
          <div className="pt-2 border-t border-[var(--color-beige)] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {order.customer_notes && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <FileText className="w-3.5 h-3.5" /> Customer Preference Notes:
                </p>
                <p className="text-amber-950 font-medium">{order.customer_notes}</p>
              </div>
            )}
            {order.internal_notes && (
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                <p className="font-bold text-purple-900 flex items-center gap-1 mb-1">
                  <FileText className="w-3.5 h-3.5" /> Internal Shop Notes:
                </p>
                <p className="text-purple-950 font-medium">{order.internal_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EVENT TIMELINE */}
      <OrderTimeline events={order.events || []} />
    </div>
  );
};
