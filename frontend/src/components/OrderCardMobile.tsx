import React from 'react';
import { Eye, Truck, CheckCircle2, Bell, Trash2 } from 'lucide-react';
import type { Order } from '../types';
import { StatusBadge, NotificationBadge } from './StatusBadge';
import { WhatsAppButton } from './WhatsAppButton';

interface OrderCardMobileProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onShiftOrder?: (order: Order) => void;
  onNotifyCustomer?: (order: Order) => void;
  onDeliverOrder?: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
}

export const OrderCardMobile: React.FC<OrderCardMobileProps> = ({
  order,
  onViewDetails,
  onShiftOrder,
  onNotifyCustomer,
  onDeliverOrder,
  onDeleteOrder
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-beige)] p-4 shadow-xs hover:shadow-md transition-all space-y-3.5 w-full overflow-hidden">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between border-b border-[var(--color-beige)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm text-[var(--color-plum)]">{order.order_number}</span>
          <span className="px-2 py-0.5 rounded-md bg-[var(--color-ivory)] border text-[10px] font-bold text-[var(--color-taupe)]">
            {order.source}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--color-taupe)] font-medium">{formatDate(order.created_at)}</span>
          {onDeleteOrder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteOrder(order);
              }}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMER INFO & WHATSAPP */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-[var(--color-charcoal)] truncate">{order.customer_name}</h4>
          <p className="text-xs text-[var(--color-taupe)] font-semibold mt-0.5">{order.display_phone || order.phone}</p>
        </div>
        <WhatsAppButton phone={order.whatsapp_phone || order.phone} size="sm" className="shrink-0" />
      </div>

      {/* ITEM DETAILS & PRICE */}
      <div className="bg-[var(--color-ivory)] p-3 rounded-xl border border-[var(--color-beige)] flex items-center justify-between text-xs gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[var(--color-charcoal)] truncate">{order.product_name || 'Garment Item'}</p>
          <p className="text-[var(--color-taupe)] font-medium mt-0.5 truncate">
            <span className="font-semibold text-[var(--color-plum)]">{order.size || 'Standard'}</span> • {order.colour || 'As Ordered'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-[var(--color-plum)]">₹{(order.total_amount ?? 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* COURIER & TRACKING (IF SHIFTED/DELIVERED) */}
      {order.courier && order.tracking_number && (
        <div className="text-xs bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between text-[var(--color-plum)] font-semibold gap-2">
          <span className="truncate">Courier: {order.courier}</span>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-purple-200 shrink-0">ID: {order.tracking_number}</span>
        </div>
      )}

      {/* STATUS & NOTIFICATION BADGES */}
      <div className="flex items-center justify-between pt-0.5">
        <StatusBadge status={order.status} />
        {order.status === 'SHIFTED' && (
          <NotificationBadge notified={order.notification_sent} />
        )}
      </div>

      {/* RESPONSIVE TOUCH ACTIONS */}
      <div className="pt-2 border-t border-[var(--color-beige)] grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewDetails(order)}
          className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-[var(--color-charcoal)] hover:bg-gray-100 flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation active:scale-[0.98]"
        >
          <Eye className="w-4 h-4 text-[var(--color-taupe)]" />
          <span>View</span>
        </button>

        {order.status === 'NEW' && onShiftOrder && (
          <button
            onClick={() => onShiftOrder(order)}
            className="py-2.5 px-3 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs min-h-[44px] touch-manipulation active:scale-[0.98]"
          >
            <Truck className="w-4 h-4" />
            <span>✓ Shift Order</span>
          </button>
        )}

        {order.status === 'SHIFTED' && (
          <div className="col-span-1 flex gap-2">
            {onNotifyCustomer && (
              <button
                onClick={() => onNotifyCustomer(order)}
                className="flex-1 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 min-h-[44px] touch-manipulation active:scale-[0.98]"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify</span>
              </button>
            )}
            {onDeliverOrder && (
              <button
                onClick={() => onDeliverOrder(order)}
                className="flex-1 py-2.5 px-2 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center justify-center gap-1 min-h-[44px] touch-manipulation active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deliver</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
