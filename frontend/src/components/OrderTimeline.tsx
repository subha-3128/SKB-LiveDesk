import React from 'react';
import { CheckCircle2, Clock, Truck, Bell, PackageCheck, ShoppingBag } from 'lucide-react';
import type { OrderEvent } from '../types';

interface OrderTimelineProps {
  events: OrderEvent[];
  status?: 'NEW' | 'SHIFTED' | 'DELIVERED';
  notificationSent?: boolean;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ events, status }) => {
  const formatDateTime = (dateStr: string) => {
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return dateStr;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
        return ShoppingBag;
      case 'ORDER_PACKED':
        return PackageCheck;
      case 'ORDER_SHIFTED':
        return Truck;
      case 'CUSTOMER_NOTIFIED':
        return Bell;
      case 'ORDER_DELIVERED':
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-[var(--color-beige)] space-y-4 shadow-xs">
      <h3 className="font-bold text-sm text-[var(--color-charcoal)] flex items-center gap-2">
        <Clock className="w-4 h-4 text-[var(--color-plum)]" />
        <span>Order Activity History</span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-beige)]">
        {events && events.length > 0 ? (
          events.map((evt, idx) => {
            const Icon = getEventIcon(evt.event_type);
            return (
              <div key={idx} className="relative flex items-start gap-3 text-xs">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[var(--color-plum)] text-white flex items-center justify-center shadow-2xs">
                  <Icon className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-charcoal)]">{evt.description}</p>
                  <p className="text-[11px] text-[var(--color-taupe)] mt-0.5">
                    {formatDateTime(evt.created_at)} • by <span className="font-semibold text-[var(--color-plum)]">{evt.created_by}</span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-[var(--color-taupe)]">No history events recorded yet.</p>
        )}

        {status && status !== 'DELIVERED' && (
          <div className="relative flex items-start gap-3 text-xs opacity-50">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div>
              <p className="font-semibold text-gray-600">Delivered</p>
              <p className="text-[11px] text-gray-400">Pending delivery confirmation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
