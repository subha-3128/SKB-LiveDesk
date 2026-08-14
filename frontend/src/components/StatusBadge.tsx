import React from 'react';

interface StatusBadgeProps {
  status: 'NEW' | 'SHIFTED' | 'DELIVERED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'NEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/30">
          <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse" />
          🟡 NEW
        </span>
      );
    case 'SHIFTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[var(--color-plum)] border border-[var(--color-plum)]/30">
          <span>📦</span>
          SHIFTED
        </span>
      );
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/30">
          <span>✓</span>
          DELIVERED
        </span>
      );
    default:
      return null;
  }
};

interface NotificationBadgeProps {
  notified: boolean;
  timestamp?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notified }) => {
  if (notified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-[var(--color-success)] border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
        🟢 Notified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-[var(--color-danger)] border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
      🔴 Not Notified
    </span>
  );
};
