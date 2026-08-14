import React, { useState, useEffect } from 'react';
import { X, CheckCircle, UserCheck, AlertCircle, ShoppingBag, Plus } from 'lucide-react';
import { apiService } from '../services/api';
import type { OrderCreateData, Order } from '../types';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const SOURCES = ['Instagram Live', 'Facebook Live', 'WhatsApp', 'Other'];

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');
  const [pincode, setPincode] = useState('');

  const [price, setPrice] = useState<number | ''>(899);
  const [source, setSource] = useState('Instagram Live');
  const [customerNotes, setCustomerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [duplicateCustomer, setDuplicateCustomer] = useState<any>(null);
  const [existingCustomerId, setExistingCustomerId] = useState<number | undefined>(undefined);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdSuccessOrder, setCreatedSuccessOrder] = useState<Order | null>(null);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!whatsappPhone || whatsappPhone === phone) {
      setWhatsappPhone(val);
    }
  };

  useEffect(() => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length === 10) {
      setIsCheckingPhone(true);
      apiService.checkDuplicateCustomer(cleanDigits)
        .then((res) => {
          if (res.exists) {
            setDuplicateCustomer(res.customer);
          } else {
            setDuplicateCustomer(null);
          }
        })
        .finally(() => setIsCheckingPhone(false));
    } else {
      setDuplicateCustomer(null);
    }
  }, [phone]);

  const handleUseExistingCustomer = () => {
    if (duplicateCustomer) {
      setCustomerName(duplicateCustomer.name);
      setAddress(duplicateCustomer.address || '');
      if (duplicateCustomer.whatsapp_phone) {
        setWhatsappPhone(duplicateCustomer.whatsapp_phone);
      }
      setExistingCustomerId(duplicateCustomer.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter customer name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter customer phone number');
      return;
    }
    if (!whatsappPhone.trim()) {
      setErrorMsg('Please enter WhatsApp number');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter delivery address');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setErrorMsg('Please enter order amount (Price)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OrderCreateData = {
        customer_name: customerName,
        phone,
        whatsapp_phone: whatsappPhone,
        address,
        landmark,
        city,
        state,
        pincode,
        product_name: "Garment Item",
        size: "Standard",
        colour: "As Ordered",
        quantity: 1,
        price: Number(price),
        source,
        customer_notes: customerNotes,
        internal_notes: internalNotes,
        existing_customer_id: existingCustomerId
      };

      const newOrder = await apiService.createOrder(payload);
      setCreatedSuccessOrder(newOrder);
      onOrderCreated(newOrder);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d: any) => d.msg).join(', '));
      } else {
        setErrorMsg(typeof detail === 'string' ? detail : 'Failed to create order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setPhone('');
    setWhatsappPhone('');
    setAddress('');
    setLandmark('');
    setCity('Kolkata');
    setState('West Bengal');
    setPincode('');
    setPrice(899);
    setSource('Instagram Live');
    setCustomerNotes('');
    setInternalNotes('');
    setDuplicateCustomer(null);
    setExistingCustomerId(undefined);
    setErrorMsg('');
    setCreatedSuccessOrder(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[var(--color-surface)] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-[var(--color-beige)] overflow-hidden animate-slide-up sm:animate-fade-in">
        <div className="px-6 py-4 border-b border-[var(--color-beige)] flex items-center justify-between bg-gradient-to-r from-[var(--color-rose-light)]/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-plum)] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-plum)]">Add New Order</h2>
              <p className="text-xs text-[var(--color-taupe)]">Create customer order from live stream or WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-taupe)] hover:bg-gray-100 hover:text-[var(--color-charcoal)] transition-colors min-h-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {createdSuccessOrder ? (
            <div className="py-8 text-center space-y-5 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-100 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-charcoal)]">Order Created Successfully!</h3>
                <p className="text-base font-semibold text-[var(--color-plum)] mt-1">Order #{createdSuccessOrder.order_number}</p>
                <p className="text-xs text-[var(--color-taupe)] mt-1">
                  Customer: {createdSuccessOrder.customer_name} ({createdSuccessOrder.display_phone || createdSuccessOrder.phone})
                </p>
              </div>

              <div className="bg-[var(--color-ivory)] p-4 rounded-xl text-left border border-[var(--color-beige)] text-xs space-y-1 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-[var(--color-taupe)]">Customer:</span>
                  <span className="font-semibold text-[var(--color-charcoal)]">{createdSuccessOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-taupe)]">WhatsApp:</span>
                  <span className="font-semibold text-[var(--color-charcoal)]">{createdSuccessOrder.whatsapp_phone || createdSuccessOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-taupe)]">Total Amount:</span>
                  <span className="font-bold text-[var(--color-plum)]">₹{(createdSuccessOrder.total_amount ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <button
                  onClick={resetForm}
                  className="py-3 px-5 rounded-xl bg-[var(--color-plum)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--color-plum-hover)] transition-colors shadow-sm min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Another Order</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl bg-gray-100 text-[var(--color-charcoal)] font-semibold text-sm hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form id="add-order-form" onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SECTION 1: CUSTOMER INFORMATION */}
              <div className="space-y-3 pb-5 border-b border-[var(--color-beige)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-plum)] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-plum)] text-white flex items-center justify-center text-[10px]">1</span>
                  Customer Information
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-plum)] transition-all bg-[var(--color-ivory)]/40 min-h-[44px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-plum)] transition-all bg-[var(--color-ivory)]/40 min-h-[44px]"
                      required
                    />
                    {isCheckingPhone && <span className="text-[11px] text-[var(--color-taupe)]">Checking phone...</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-plum)] transition-all bg-[var(--color-ivory)]/40 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                {duplicateCustomer && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-900">
                      <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold">Existing Customer Found: {duplicateCustomer.name}</p>
                        <p className="text-[11px] text-amber-800">{duplicateCustomer.order_count} previous orders recorded</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseExistingCustomer}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold text-xs hover:bg-amber-700 transition-colors shadow-2xs min-h-[36px]"
                    >
                      Use Existing
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No, Street, Area"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-beige)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-plum)] transition-all bg-[var(--color-ivory)]/40"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Landmark"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-beige)] bg-[var(--color-ivory)]/30 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-beige)] bg-[var(--color-ivory)]/30 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-beige)] bg-[var(--color-ivory)]/30 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="PIN Code"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-beige)] bg-[var(--color-ivory)]/30 min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ORDER AMOUNT & SOURCE */}
              <div className="space-y-3 pb-5 border-b border-[var(--color-beige)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-plum)] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-plum)] text-white flex items-center justify-center text-[10px]">2</span>
                  Order Amount & Source
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">
                      Order Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="e.g. 899"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-base font-black text-[var(--color-plum)] min-h-[44px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Order Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-semibold text-[var(--color-charcoal)] min-h-[44px] bg-white"
                    >
                      {SOURCES.map((src) => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: NOTES */}
              <div className="space-y-3 pb-5 border-b border-[var(--color-beige)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-plum)] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-plum)] text-white flex items-center justify-center text-[10px]">3</span>
                  Notes & Instructions (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-taupe)] mb-1">Customer Request / Instructions</label>
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. Needs delivery before Sunday"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-beige)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-taupe)] mb-1">Internal Staff Notes</label>
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="e.g. Screenshot received on WhatsApp"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-beige)] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER ACTION */}
              <div className="bg-[var(--color-rose-light)]/40 p-4 rounded-xl border border-[var(--color-beige)] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--color-taupe)] font-medium">Total Payable</p>
                  <p className="text-2xl font-black text-[var(--color-plum)]">₹{typeof price === 'number' ? price.toLocaleString('en-IN') : '0'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold hover:bg-gray-100 transition-colors min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all min-h-[44px] flex items-center gap-2"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
