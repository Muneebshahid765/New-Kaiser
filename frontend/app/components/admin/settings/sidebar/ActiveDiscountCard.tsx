// app/components/admin/settings/sidebar/ActiveDiscountCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateSiteWideDiscount } from '@/app/features/admin/hooks/admin-settings.hooks';

interface ActiveDiscountCardProps {
  discount?: {
    enabled: boolean;
    bannerText: string;
    discountPercentage?: number;
  };
}

export default function ActiveDiscountCard({ discount }: ActiveDiscountCardProps) {
  const updateDiscount = useUpdateSiteWideDiscount();

  // ✅ Safe initialization with optional chaining and fallback defaults
  const [enabled, setEnabled] = useState<boolean>(discount?.enabled ?? false);
  const [bannerText, setBannerText] = useState<string>(discount?.bannerText ?? '');

  // ✅ Sync local state when backend query finishes loading
  useEffect(() => {
    if (discount) {
      setEnabled(discount.enabled ?? false);
      setBannerText(discount.bannerText ?? '');
    }
  }, [discount]);

  const handleToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    
    updateDiscount.mutate({
      enabled: nextState,
      bannerText,
    });
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Site-wide Discount</span>
        <button
          type="button"
          onClick={handleToggle}
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
            enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <span className="bg-white w-4 h-4 rounded-full shadow" />
        </button>
      </div>

      <input
        type="text"
        value={bannerText}
        onChange={(e) => setBannerText(e.target.value)}
        placeholder="Enter active discount banner message..."
        className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}