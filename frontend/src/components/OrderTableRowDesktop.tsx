import React from 'react';
import { Eye, Truck, CheckCircle2, Bell, Trash2 } from 'lucide-react';
import type { Order } from '../types';
import { StatusBadge, NotificationBadge } from './StatusBadge';
import { WhatsAppButton } from './WhatsAppButton';

interface OrderTableRowDesktopProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onShiftOrder?: (order: Order) => void;
  onNotifyCustomer?: (order: Order) => void;
  onDeliverOrder?: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
}

export const OrderTableRowDesktop: React.FC<OrderTableRowDesktopProps> = ({
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
      return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <tr className="border-b border-[var(--color-beige)] hover:bg-[var(--color-ivory)]/60 transition-colors text-xs">
      <td className="py-3 px-4 font-bold text-[var(--color-plum)] whitespace-nowrap">
        <div>{order.order_number}</div>
        <span className="text-[10px] text-[var(--color-taupe)] font-normal">{order.source}</span>
      </td>

      <td className="py-3 px-4 font-medium text-[var(--color-charcoal)]">
        <div className="font-bold text-sm text-[var(--color-charcoal)]">{order.customer_name}</div>
        <div className="text-[var(--color-taupe)] font-medium text-[11px]">{order.display_phone}</div>
      </td>

      <td className="py-3 px-4">
        <div className="font-semibold text-[var(--color-charcoal)]">{order.product_name}</div>
        <div className="text-[var(--color-taupe)] text-[11px]">
          <span className="font-bold text-[var(--color-plum)]">{order.size}</span> • {order.colour} (Qty {order.quantity})
        </div>
      </td>

      <td className="py-3 px-4 font-black text-sm text-[var(--color-plum)] whitespace-nowrap">
        ₹{(order.total_amount ?? 0).toLocaleString('en-IN')}
      </td>

      <td className="py-3 px-4 whitespace-nowrap space-y-1">
        <div><StatusBadge status={order.status} /></div>
        {order.status === 'SHIFTED' && (
          <div><NotificationBadge notified={order.notification_sent} /></div>
        )}
      </td>

      <td className="py-3 px-4 text-[11px] text-[var(--color-taupe)]">
        {order.courier ? (
          <div>
            <span className="font-bold text-[var(--color-charcoal)]">{order.courier}</span>
            <div className="font-mono text-[10px]">{order.tracking_number}</div>
          </div>
        ) : (
          <span className="italic opacity-60">Pending</span>
        )}
      </td>

      <td className="py-3 px-4 text-[11px] text-[var(--color-taupe)] whitespace-nowrap">
        {formatDate(order.created_at)}
      </td>

      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 justify-end">
          <WhatsAppButton phone={order.whatsapp_phone || order.phone} size="sm" />

          <button
            onClick={() => onViewDetails(order)}
            className="p-2 rounded-lg text-[var(--color-taupe)] hover:text-[var(--color-plum)] hover:bg-gray-100 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {order.status === 'NEW' && onShiftOrder && (
            <button
              onClick={() => onShiftOrder(order)}
              className="py-1.5 px-3 rounded-lg bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Shift</span>
            </button>
          )}

          {order.status === 'SHIFTED' && (
            <>
              {onNotifyCustomer && (
                <button
                  onClick={() => onNotifyCustomer(order)}
                  className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify</span>
                </button>
              )}
              {onDeliverOrder && (
                <button
                  onClick={() => onDeliverOrder(order)}
                  className="py-1.5 px-2.5 rounded-lg bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white font-bold text-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deliver</span>
                </button>
              )}
            </>
          )}

          {onDeleteOrder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteOrder(order);
              }}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
