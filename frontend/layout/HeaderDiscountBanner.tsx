'use client';

import React, { useState, useEffect } from 'react';

interface DiscountTimerPart {
  label: string;
  value: string;
}

interface DiscountTimer {
  parts: DiscountTimerPart[];
  status: string;
}

interface HeaderDiscountBannerProps {
  publicDiscount?: {
    enabled?: boolean;
    endDate?: string | Date;
    bannerText?: string;
  };
}

export const HeaderDiscountBanner: React.FC<HeaderDiscountBannerProps> = ({
  publicDiscount,
}) => {
  const [discountTimer, setDiscountTimer] = useState<DiscountTimer>({
    parts: [],
    status: '',
  });

  useEffect(() => {
    if (!publicDiscount?.enabled) {
      setDiscountTimer({ parts: [], status: '' });
      return;
    }
    if (!publicDiscount?.endDate) {
      setDiscountTimer({ parts: [], status: 'Live until further notice' });
      return;
    }

    const buildTimerPayload = (): DiscountTimer => {
      const targetDate = new Date(publicDiscount.endDate as string);
      if (isNaN(targetDate.getTime())) return { parts: [], status: 'Ending soon' };

      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return { parts: [], status: 'Ending soon' };

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const parts: DiscountTimerPart[] = [];
      if (days > 0) parts.push({ label: 'Days', value: String(days).padStart(2, '0') });
      parts.push({ label: 'Hours', value: String(hours).padStart(2, '0') });
      parts.push({ label: 'Mins', value: String(minutes).padStart(2, '0') });
      parts.push({ label: 'Secs', value: String(seconds).padStart(2, '0') });

      return { parts, status: 'left' };
    };

    setDiscountTimer(buildTimerPayload());
    const intervalId = setInterval(() => setDiscountTimer(buildTimerPayload()), 1000);
    return () => clearInterval(intervalId);
  }, [publicDiscount]);

  if (!publicDiscount?.enabled) return null;

  return (
    <div className="w-full bg-gradient-to-r from-orange-500/95 to-rose-500/92 py-2 text-orange-50 border-b border-white/15 shadow-[inset_0_-1px_rgba(0,0,0,0.25)]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-[18px] px-6 flex-wrap">
        <div className="flex items-center gap-3.5 flex-1 min-w-[250px]">
          <span className="px-3 py-1 rounded-full bg-slate-900/35 border border-white/25 text-amber-50 text-xs font-bold tracking-[0.6px] uppercase inline-flex items-center gap-2">
            Site-wide deal
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="m-0 text-sm font-semibold tracking-[0.4px] text-white">
              {publicDiscount.bannerText || 'Limited time offer for all products'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs uppercase tracking-[0.4px] text-white/80">Ends in</span>
          {discountTimer.parts.length > 0 && (
            <div className="flex justify-center gap-2.5">
              {discountTimer.parts.map((part) => (
                <div
                  key={part.label}
                  className="bg-slate-900/35 border border-white/15 rounded-lg px-2.5 py-1.5 min-w-[50px] text-center shadow-[0_4px_10px_rgba(15,23,42,0.25)]"
                >
                  <span className="block text-sm font-bold tracking-[0.6px]">{part.value}</span>
                  <span className="block text-xs uppercase tracking-[0.5px] text-white/75">{part.label}</span>
                </div>
              ))}
            </div>
          )}
          {discountTimer.status && (
            <span className="text-xs text-white/85">{discountTimer.status}</span>
          )}
        </div>
      </div>
    </div>
  );
};