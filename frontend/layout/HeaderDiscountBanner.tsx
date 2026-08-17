'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface DiscountTimerPart {
  label: string;
  value: string;
}

interface DiscountTimer {
  parts: DiscountTimerPart[];
  status: string;
}

export interface HeaderDiscountBannerProps {
  publicDiscount?: {
    enabled?: boolean;
    endDate?: string | Date | null;
    bannerText?: string;
    percentage?: number;
  } | null;
}

export const HeaderDiscountBanner: React.FC<HeaderDiscountBannerProps> = ({
  publicDiscount,
}) => {
  const [discountTimer, setDiscountTimer] = useState<DiscountTimer>({
    parts: [],
    status: '',
  });
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR/Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safe data extraction handling nested wrappers
  const discountData = useMemo(() => {
    if (!publicDiscount) return null;
    const raw = (publicDiscount as any)?.data ?? publicDiscount;
    return {
      enabled: Boolean(raw?.enabled),
      endDate: raw?.endDate ?? null,
      bannerText: raw?.bannerText || 'Limited-time sitewide discount offer',
      percentage: raw?.percentage ?? null,
    };
  }, [publicDiscount]);

  useEffect(() => {
    if (!discountData?.enabled) {
      setDiscountTimer({ parts: [], status: '' });
      return;
    }

    if (!discountData.endDate) {
      setDiscountTimer({ parts: [], status: 'Live until further notice' });
      return;
    }

    const calculateTime = (): DiscountTimer => {
      const targetDate = new Date(discountData.endDate as string | Date);
      if (isNaN(targetDate.getTime())) {
        return { parts: [], status: 'Ending soon' };
      }

      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        return { parts: [], status: 'Offer expired' };
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const parts: DiscountTimerPart[] = [];
      if (days > 0) parts.push({ label: 'D', value: String(days).padStart(2, '0') });
      parts.push({ label: 'H', value: String(hours).padStart(2, '0') });
      parts.push({ label: 'M', value: String(minutes).padStart(2, '0') });
      parts.push({ label: 'S', value: String(seconds).padStart(2, '0') });

      return { parts, status: 'left' };
    };

    setDiscountTimer(calculateTime());
    const interval = setInterval(() => {
      setDiscountTimer(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [discountData]);

  if (!isMounted || !discountData?.enabled) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 py-2 px-4 text-white shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm flex-wrap sm:flex-nowrap">
        {/* Deal Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 bg-slate-900/40 text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-amber-400/30">
            {discountData.percentage ? `${discountData.percentage}% OFF` : 'DEAL'}
          </span>
          <p className="font-medium truncate m-0 text-white/95">
            {discountData.bannerText}
          </p>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="hidden md:inline text-[11px] text-white/80 uppercase font-medium tracking-wide">
            Ends in:
          </span>
          {discountTimer.parts.length > 0 ? (
            <div className="flex items-center gap-1.5 font-mono">
              {discountTimer.parts.map((part) => (
                <div
                  key={part.label}
                  className="bg-slate-900/50 border border-white/20 rounded px-1.5 py-0.5 text-center min-w-[32px]"
                >
                  <span className="block text-xs font-bold leading-tight">{part.value}</span>
                  <span className="block text-[8px] text-amber-200/80 leading-none">{part.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs font-medium text-amber-200 bg-slate-900/40 px-2 py-0.5 rounded border border-white/10">
              {discountTimer.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};