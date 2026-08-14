import React, { useState } from 'react';
import { X, Truck, AlertCircle } from 'lucide-react';
import type { Order, OrderShiftData } from '../types';

interface ShiftOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmShift: (orderId: number, data: OrderShiftData) => Promise<void>;
}

const COMMON_COURIERS = ['eKart', 'DTDC', 'Delhivery', 'India Post', 'Professional Courier', 'Bluedart'];

export const ShiftOrderModal: React.FC<ShiftOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmShift
}) => {
  if (!isOpen || !order) return null;

  const [courier, setCourier] = useState(order.courier || 'eKart');
  const [customCourier, setCustomCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalCourier = courier === 'Other' ? customCourier.trim() : courier;
    if (!finalCourier) {
      setErrorMsg('Please enter courier name');
      return;
    }
    if (!trackingNumber.trim()) {
      setErrorMsg('Tracking number is required before shifting the order');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmShift(order.id, {
        courier: finalCourier,
        tracking_number: trackingNumber.trim(),
        internal_notes: internalNotes.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to shift order. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[var(--color-surface)] rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl border border-[var(--color-beige)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-beige)] flex items-center justify-between bg-[var(--color-rose-light)]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[var(--color-plum)] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--color-charcoal)]">Shift Order #{order.order_number}</h3>
              <p className="text-xs text-[var(--color-taupe)]">Dispatch from shop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-taupe)] hover:bg-gray-100 min-h-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-[var(--color-ivory)] p-3 rounded-xl border border-[var(--color-beige)] text-xs space-y-1">
            <p className="font-bold text-[var(--color-charcoal)]">{order.customer_name}</p>
            <p className="text-[var(--color-taupe)]">{order.product_name || 'Garment Item'} ({order.size || 'Standard'})</p>
            <p className="font-semibold text-[var(--color-plum)]">Amount: ₹{(order.total_amount ?? 0).toLocaleString('en-IN')}</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
              Courier Name <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_COURIERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCourier(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    courier === c
                      ? 'bg-[var(--color-plum)] text-white font-bold'
                      : 'bg-gray-100 text-[var(--color-charcoal)] hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCourier('Other')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  courier === 'Other' ? 'bg-[var(--color-plum)] text-white' : 'bg-gray-100 text-[var(--color-taupe)]'
                }`}
              >
                + Other
              </button>
            </div>

            {courier === 'Other' && (
              <input
                type="text"
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                placeholder="Enter courier name"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-beige)]"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
              Tracking / AWB Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. EK123456789IN"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-semibold text-[var(--color-charcoal)] focus:ring-2 focus:ring-[var(--color-plum)] min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-taupe)] mb-1">Shipping Notes (Optional)</label>
            <input
              type="text"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Dispatched via eKart pickup"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-beige)] text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-100 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-plum)] text-white text-xs font-bold shadow-md hover:bg-[var(--color-plum-hover)] transition-colors min-h-[44px]"
            >
              {isSubmitting ? 'Shifting...' : '✓ Confirm Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
