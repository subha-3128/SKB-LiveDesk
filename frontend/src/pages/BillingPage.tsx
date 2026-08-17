import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, Printer, MessageCircle, Copy, RefreshCw, CheckCircle2, User, Search, Grid, LayoutGrid } from 'lucide-react';
import { apiService } from '../services/api';

interface BillItem {
  id: string;
  description: string;
  quantity: number | '';
  price: number | '';
}

export const BillingPage: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState(() => `INV-${Math.floor(100000 + Math.random() * 900000)}`);

  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);

  // Billing Desk 4-up A4 printing options: '4-up' | 'single' | '1' | '2' | '3' | '4'
  const [printMode, setPrintMode] = useState<'4-up' | 'single' | '1' | '2' | '3' | '4'>('4-up');

  const [items, setItems] = useState<BillItem[]>([
    { id: '1', description: 'Designer Blouse Item', quantity: 1, price: 0 },
    { id: '2', description: 'Silk Dupatta / Saree', quantity: 1, price: 0 }
  ]);

  // Phone lookup for existing customers
  useEffect(() => {
    const cleanDigits = customerPhone.replace(/\D/g, '');
    if (cleanDigits.length === 10) {
      setIsSearchingPhone(true);
      apiService.checkDuplicateCustomer(cleanDigits)
        .then((res) => {
          if (res.exists && res.customer) {
            if (!customerName) setCustomerName(res.customer.name);
          }
        })
        .finally(() => setIsSearchingPhone(false));
    }
  }, [customerPhone]);

  const addItemRow = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: 'New Garment Item', quantity: 1, price: 0 }
    ]);
  };

  const removeItemRow = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Generate clean WhatsApp message
  const getWhatsAppMessage = () => {
    let msg = `*Invoice #${invoiceNo} — Sri Krishna Blouse Museum*\n`;
    msg += `Date: ${billDate}\n`;
    msg += `Customer: ${customerName || 'Valued Customer'}\n\n`;
    msg += `*Items Purchased:*\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.description} (x${item.quantity || 0}) - ₹${Number(item.quantity) * Number(item.price)}\n`;
    });
    if (discountAmount > 0) {
      msg += `Discount: -₹${discountAmount}\n`;
    }
    msg += `\n*Net Total Payable: ₹${grandTotal.toLocaleString('en-IN')}*\n\nThank you for shopping with Sri Krishna Blouse Museum! ❤️`;
    return msg;
  };

  const getWhatsAppURL = () => {
    const cleanDigits = customerPhone.replace(/\D/g, '');
    const phoneTarget = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const msg = getWhatsAppMessage();
    if (phoneTarget) {
      return `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetBill = () => {
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
    setInvoiceNo(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
    setItems([
      { id: '1', description: 'Designer Blouse Item', quantity: 1, price: 0 }
    ]);
  };

  // Single Compact Receipt Component for 4-up quadrant slots
  const CompactReceipt: React.FC = () => (
    <div className="border border-gray-800 rounded-md p-2.5 bg-white text-[10px] font-sans h-full flex flex-col justify-between overflow-hidden">
      <div>
        {/* HEADER BRANDING */}
        <div className="text-center border-b border-gray-400 pb-1 font-sans">
          <h2 className="text-xs font-bold text-gray-900 leading-tight">Sri Krishna Blouse Museum</h2>
          <p className="text-[8.5px] text-gray-600">Helencha Bazar, Bagdah Road, North 24 Parganas, WB</p>
          <p className="text-[8.5px] text-gray-700 font-semibold">Ph: +91 7479255176</p>
        </div>

        {/* CUSTOMER & INVOICE META */}
        <div className="border-b border-gray-300 py-1 text-[9px] flex justify-between font-medium">
          <div>
            <p>Inv: <span className="font-bold text-gray-900">{invoiceNo}</span></p>
            <p className="truncate max-w-[45mm]">Cust: <span className="font-bold text-gray-900">{customerName || 'Valued Customer'}</span></p>
          </div>
          <div className="text-right">
            <p>Date: {billDate}</p>
            <p>Mob: {customerPhone || 'N/A'}</p>
          </div>
        </div>

        {/* ITEMS LIST TABLE */}
        <div className="py-1 space-y-0.5">
          {items.map((it, i) => (
            <div key={i} className="flex justify-between text-[9px] leading-tight">
              <span className="truncate pr-1">{i + 1}. {it.description} (x{it.quantity || 0})</span>
              <span className="font-bold shrink-0">₹{(Number(it.quantity) * Number(it.price)).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER & TOTALS */}
      <div className="shrink-0 border-t border-gray-400 pt-1 space-y-0.5">
        {discountAmount > 0 && (
          <div className="flex justify-between text-[9px] text-red-600 font-semibold">
            <span>Discount:</span>
            <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-[11px] font-bold text-gray-900 pt-0.5">
          <span>NET PAYABLE:</span>
          <span className="text-xs font-black">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="text-center text-[8px] text-gray-500 pt-1 border-t border-dashed border-gray-300 mt-0.5">
          Thank you! ❤️ Sri Krishna Blouse Museum
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-plum)] text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-plum)]">Billing Desk &amp; Invoice Counter</h1>
            <p className="text-xs text-[var(--color-taupe)] font-medium mt-0.5">
              Print 4 bills on 1 A4 paper, generate instant receipts, calculate discounts, and share WhatsApp invoices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={resetBill}
            className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[var(--color-taupe)] hover:bg-gray-50 flex items-center gap-1.5 min-h-[44px] touch-manipulation"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleCopyMessage}
            className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 min-h-[44px] touch-manipulation"
          >
            <Copy className="w-4 h-4 text-emerald-600" />
            <span>{copiedToast ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <a
            href={getWhatsAppURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs min-h-[44px] touch-manipulation"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Bill</span>
          </a>

          <button
            onClick={handlePrint}
            className="py-2.5 px-4 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center gap-2 shadow-xs min-h-[44px] touch-manipulation"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 (4-up)</span>
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md no-print animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>WhatsApp bill text copied to clipboard! Ready to paste.</span>
        </div>
      )}

      {/* BILLING WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* LEFT COLUMN: BILLING DESK & CUSTOMER SETTINGS */}
        <div className="glass-card p-5 rounded-2xl space-y-4 h-fit">
          <div className="border-b border-[var(--color-beige)] pb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-plum)] flex items-center gap-2">
              <User className="w-4 h-4" /> Billing Desk Controls
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-rose-light)] text-[var(--color-plum)] text-[10px] font-bold">
              4-up A4 Enabled
            </span>
          </div>

          <div className="space-y-3">
            {/* PRINT LAYOUT SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-plum)] mb-1 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" /> A4 Print Layout Mode
              </label>
              <select
                value={printMode}
                onChange={(e: any) => setPrintMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[var(--color-plum)] font-bold text-xs bg-[var(--color-ivory)] text-[var(--color-plum)] focus:outline-none min-h-[44px]"
              >
                <option value="4-up">🖨️ 4 Bills on 1 A4 Page (Save Paper)</option>
                <option value="single">📄 Single Full-Page Receipt</option>
                <option value="1">Position 1: Top Left Only</option>
                <option value="2">Position 2: Top Right Only</option>
                <option value="3">Position 3: Bottom Left Only</option>
                <option value="4">Position 4: Bottom Right Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] font-mono text-sm font-bold bg-[var(--color-ivory)]/50 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Invoice Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-xs font-semibold min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Customer Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9832080964"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-xs font-semibold min-h-[44px]"
                />
                {isSearchingPhone && (
                  <Search className="w-4 h-4 absolute right-3.5 top-3 text-[var(--color-plum)] animate-spin" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer full name..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-xs font-semibold min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Special Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-bold text-red-600 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ITEMIZED BILL & PREVIEW */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-beige)] pb-3">
              <h2 className="text-base font-bold text-[var(--color-charcoal)]">Itemized Bill Items</h2>
              <button
                onClick={addItemRow}
                className="py-2 px-3.5 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs min-h-[36px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item Line</span>
              </button>
            </div>

            {/* ITEMS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-beige)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-taupe)]">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Price (₹)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-beige)] text-xs font-medium">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="py-2.5 px-3 text-center font-bold text-[var(--color-plum)]">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[var(--color-plum)] min-h-[36px]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateItem(item.id, 'quantity', val === '' ? '' : Math.max(1, Number(val)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-center min-h-[36px]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateItem(item.id, 'price', val === '' ? '' : Math.max(0, Number(val)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-right min-h-[36px]"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-[var(--color-plum)]">
                        ₹{(Number(item.quantity) * Number(item.price)).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => removeItemRow(item.id)}
                          disabled={items.length <= 1}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BILL TOTALS SUMMARY */}
            <div className="pt-4 border-t border-[var(--color-beige)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-ivory)]/40 p-4 rounded-xl">
              <div>
                <p className="text-xs text-[var(--color-taupe)] font-semibold">Total Line Items: <span className="font-bold text-[var(--color-charcoal)]">{items.length}</span></p>
                {discountAmount > 0 && (
                  <p className="text-xs text-red-600 font-bold mt-0.5">Discount Applied: -₹{discountAmount.toLocaleString('en-IN')}</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-[var(--color-taupe)] font-bold uppercase tracking-wider">Net Amount Payable</p>
                <p className="text-3xl font-black text-[var(--color-plum)]">₹{grandTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* 4-UP A4 SHEET PREVIEW ON SCREEN */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-plum)] flex items-center gap-1.5">
                <Grid className="w-4 h-4" /> A4 Paper Layout Preview (4 Bills Per Sheet)
              </h3>
              <button
                onClick={handlePrint}
                className="py-1 px-3 rounded-lg bg-[var(--color-plum)] text-white text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print Now
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 bg-gray-50/50">
              <p className="text-[11px] text-[var(--color-taupe)] font-medium mb-3 text-center">
                📄 Below is the exact 4-quadrant layout that will print on a single A4 paper sheet:
              </p>

              <div className="grid grid-cols-2 gap-3 aspect-[210/297] max-w-md mx-auto bg-white p-3 border border-gray-300 shadow-sm rounded-lg">
                <div className={`p-1 rounded ${printMode === '4-up' || printMode === '1' ? 'ring-2 ring-[var(--color-plum)] bg-white' : 'opacity-25'}`}>
                  <CompactReceipt />
                </div>
                <div className={`p-1 rounded ${printMode === '4-up' || printMode === '2' ? 'ring-2 ring-[var(--color-plum)] bg-white' : 'opacity-25'}`}>
                  <CompactReceipt />
                </div>
                <div className={`p-1 rounded ${printMode === '4-up' || printMode === '3' ? 'ring-2 ring-[var(--color-plum)] bg-white' : 'opacity-25'}`}>
                  <CompactReceipt />
                </div>
                <div className={`p-1 rounded ${printMode === '4-up' || printMode === '4' ? 'ring-2 ring-[var(--color-plum)] bg-white' : 'opacity-25'}`}>
                  <CompactReceipt />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY DOM CONTAINER (HIDDEN ON SCREEN, RENDERED ONLY ON PRINT) */}
      <div className="hidden print:block print-page-4up">
        {printMode === '4-up' ? (
          <>
            <div className="print-slot"><CompactReceipt /></div>
            <div className="print-slot"><CompactReceipt /></div>
            <div className="print-slot"><CompactReceipt /></div>
            <div className="print-slot"><CompactReceipt /></div>
          </>
        ) : printMode === '1' ? (
          <>
            <div className="print-slot"><CompactReceipt /></div>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot opacity-0"></div>
          </>
        ) : printMode === '2' ? (
          <>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot"><CompactReceipt /></div>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot opacity-0"></div>
          </>
        ) : printMode === '3' ? (
          <>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot"><CompactReceipt /></div>
            <div className="print-slot opacity-0"></div>
          </>
        ) : printMode === '4' ? (
          <>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot opacity-0"></div>
            <div className="print-slot"><CompactReceipt /></div>
          </>
        ) : (
          <div className="col-span-2 row-span-2 printable-single">
            <div className="border-2 border-[var(--color-plum)] rounded-xl p-6 bg-white space-y-4 max-w-lg mx-auto text-xs font-sans">
              <div className="text-center border-b border-gray-300 pb-3">
                <h2 className="text-lg font-black text-[var(--color-plum)]">Sri Krishna Blouse Museum</h2>
                <p className="text-[11px] text-[var(--color-taupe)]">Helencha Bazar, Bagdah Road, Bagdah, North 24 Parganas, West Bengal</p>
                <p className="text-[11px] text-[var(--color-taupe)] font-semibold mt-0.5">Phone: +91 7479255176</p>
              </div>

              <div className="flex justify-between text-[11px] font-semibold border-b border-gray-200 pb-2">
                <div>
                  <p><span className="text-[var(--color-taupe)]">Invoice No:</span> <span className="font-bold text-[var(--color-plum)]">{invoiceNo}</span></p>
                  <p><span className="text-[var(--color-taupe)]">Customer:</span> <span className="font-bold text-[var(--color-charcoal)]">{customerName || 'Valued Customer'}</span></p>
                </div>
                <div className="text-right">
                  <p><span className="text-[var(--color-taupe)]">Date:</span> {billDate}</p>
                  <p><span className="text-[var(--color-taupe)]">Phone:</span> {customerPhone || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {items.map((it, i) => (
                  <div key={i} className="flex justify-between text-xs font-medium">
                    <span className="truncate flex-1 pr-2">{i + 1}. {it.description} (x{it.quantity || 0})</span>
                    <span className="font-bold shrink-0">₹{(Number(it.quantity) * Number(it.price)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-red-600 font-bold border-t border-gray-200 pt-1.5">
                  <span>Discount Applied:</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black border-t-2 border-[var(--color-plum)] pt-2 text-[var(--color-plum)]">
                <span>TOTAL AMOUNT PAYABLE:</span>
                <span className="text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="text-center text-[10px] text-[var(--color-taupe)] pt-3 border-t border-dashed border-gray-300">
                Thank you for shopping with us! ❤️ Sri Krishna Blouse Museum
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
