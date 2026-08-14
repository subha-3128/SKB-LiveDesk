import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import type { ShopSettings } from '../types';
import { apiService } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettings>({
    shop_name: 'Bepari & Brothers',
    shop_phone: '+91 98765 00000',
    whatsapp_number: '+91 98765 00000',
    address: '12 MG Road, Park Street area, Kolkata, West Bengal 700016',
    default_country_code: '+91',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiService.getSettings().then((data) => setSettings(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.updateSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="bg-white p-5 rounded-2xl border border-[var(--color-beige)] shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-plum)] text-white flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-charcoal)]">Shop Settings</h1>
          <p className="text-xs text-[var(--color-taupe)]">Configure business information, contact details, and currency</p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Shop settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[var(--color-beige)] shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Shop / Business Name</label>
          <input
            type="text"
            value={settings.shop_name}
            onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-semibold min-h-[44px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Shop Phone Number</label>
            <input
              type="text"
              value={settings.shop_phone}
              onChange={(e) => setSettings({ ...settings, shop_phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-semibold min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">WhatsApp Business Number</label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-beige)] text-sm font-semibold min-h-[44px]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Shop Address</label>
          <textarea
            rows={2}
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-beige)] text-xs font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-[var(--color-taupe)] mb-1">Country Code</label>
            <input
              type="text"
              value={settings.default_country_code}
              readOnly
              className="w-full px-3 py-2 rounded-xl border bg-gray-50 text-[var(--color-taupe)] font-bold min-h-[40px]"
            />
          </div>
          <div>
            <label className="block font-medium text-[var(--color-taupe)] mb-1">Currency</label>
            <input
              type="text"
              value={settings.currency}
              readOnly
              className="w-full px-3 py-2 rounded-xl border bg-gray-50 text-[var(--color-taupe)] font-bold min-h-[40px]"
            />
          </div>
          <div>
            <label className="block font-medium text-[var(--color-taupe)] mb-1">Timezone</label>
            <input
              type="text"
              value={settings.timezone}
              readOnly
              className="w-full px-3 py-2 rounded-xl border bg-gray-50 text-[var(--color-taupe)] font-bold min-h-[40px]"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-beige)] flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-xs font-bold flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
