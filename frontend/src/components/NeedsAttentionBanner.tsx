import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import type { NeedsAttentionItem } from '../types';

interface NeedsAttentionBannerProps {
  items: NeedsAttentionItem[];
  onSelectFilter?: (tab: string, filter?: string) => void;
  onAction?: (type: string) => void;
}

export const NeedsAttentionBanner: React.FC<NeedsAttentionBannerProps> = ({ items, onSelectFilter, onAction }) => {
  if (!items || items.length === 0) return null;

  const severityStyles = {
    red: 'bg-red-50 border-red-200 text-red-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900'
  };

  const badgeStyles = {
    red: 'bg-[var(--color-danger)] text-white',
    amber: 'bg-[var(--color-warning)] text-white',
    orange: 'bg-orange-500 text-white'
  };

  const handleClick = (item: NeedsAttentionItem) => {
    if (onAction) {
      onAction(item.type);
      return;
    }
    if (onSelectFilter) {
      if (item.type === 'UNNOTIFIED') {
        onSelectFilter('shifted', 'unnotified');
      } else if (item.type === 'READY_TO_SHIFT') {
        onSelectFilter('orders');
      } else if (item.type === 'MISSING_TRACKING') {
        onSelectFilter('shifted', 'missing_tracking');
      }
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-white border border-[var(--color-beige)] p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
          <Bell className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-sm text-[var(--color-charcoal)]">Needs Attention</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
          {items.reduce((acc, curr) => acc + curr.count, 0)} action items
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(item)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:shadow-xs ${
              severityStyles[item.severity]
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${badgeStyles[item.severity]}`}>
                {item.count}
              </span>
              <p className="text-xs font-semibold leading-tight">{item.message}</p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
};
