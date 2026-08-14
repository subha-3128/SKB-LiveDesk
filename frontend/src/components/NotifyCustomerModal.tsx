import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types';
import { WhatsAppButton } from './WhatsAppButton';

interface NotifyCustomerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmNotificationSent: (orderId: number) => Promise<void>;
}

export const NotifyCustomerModal: React.FC<NotifyCustomerModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmNotificationSent
}) => {
  if (!isOpen || !order) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkSent = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmNotificationSent(order.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[var(--color-surface)] rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-beige)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-beige)] flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--color-charcoal)]">Notify Customer via WhatsApp</h3>
              <p className="text-xs text-emerald-800">Order #{order.order_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-taupe)] hover:bg-gray-100 min-h-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-xs space-y-1">
            <p className="text-[var(--color-taupe)]">Customer:</p>
            <p className="font-bold text-sm text-[var(--color-charcoal)]">{order.customer_name} ({order.display_phone})</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-taupe)]">Pre-filled WhatsApp Message</label>
            <div className="p-4 rounded-xl bg-[var(--color-ivory)] border border-[var(--color-beige)] text-xs text-[var(--color-charcoal)] whitespace-pre-wrap font-sans leading-relaxed shadow-2xs">
              {order.whatsapp_message}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <span>1️⃣</span> Step 1: Open WhatsApp and press Send
            </p>
            <WhatsAppButton
              phone={order.whatsapp_phone || order.phone}
              message={order.whatsapp_message}
              label="Open WhatsApp Chat"
              size="lg"
              className="w-full justify-center text-sm font-bold shadow-md"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
              <span>2️⃣</span> Step 2: Record in system after sending
            </p>
            <button
              onClick={handleMarkSent}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{isSubmitting ? 'Recording...' : 'Mark Notification as Sent'}</span>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-xs text-[var(--color-taupe)] hover:underline min-h-[36px]"
            >
              Close without updating status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
