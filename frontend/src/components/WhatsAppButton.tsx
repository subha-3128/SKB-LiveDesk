import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message,
  className = '',
  size = 'md',
  label = 'WhatsApp'
}) => {
  const normPhone = phone.replace(/\D/g, '');
  const cleanPhone = normPhone.length === 10 ? `91${normPhone}` : normPhone;
  
  const href = message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 min-h-[36px]',
    md: 'px-3.5 py-2 text-sm gap-2 min-h-[44px]',
    lg: 'px-4 py-2.5 text-base gap-2.5 min-h-[48px]'
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors shadow-sm hover:shadow ${sizeClasses[size]} ${className}`}
      title={`Open WhatsApp chat with ${phone}`}
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{label}</span>
    </a>
  );
};
