'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateSiteWideDiscount } from '@/app/features/admin/hooks/admin-settings.hooks';

interface DiscountTabProps {
  discount?: {
    enabled: boolean;
    percentage?: number;
    bannerText: string;
  };
}

const DEFAULT_DISCOUNT = {
  enabled: false,
  percentage: 0,
  bannerText: '',
};

export default function DiscountTab({ discount }: DiscountTabProps) {
  const updateDiscount = useUpdateSiteWideDiscount();

  // ✅ Safe state initialization with optional chaining and fallbacks
  const [enabled, setEnabled] = useState<boolean>(discount?.enabled ?? DEFAULT_DISCOUNT.enabled);
  const [percentage, setPercentage] = useState<number>(discount?.percentage ?? DEFAULT_DISCOUNT.percentage);
  const [bannerText, setBannerText] = useState<string>(discount?.bannerText ?? DEFAULT_DISCOUNT.bannerText);

  // ✅ Keep local state in sync when backend data arrives asynchronously
  useEffect(() => {
    if (discount) {
      setEnabled(discount.enabled ?? DEFAULT_DISCOUNT.enabled);
      setPercentage(discount.percentage ?? DEFAULT_DISCOUNT.percentage);
      setBannerText(discount.bannerText ?? DEFAULT_DISCOUNT.bannerText);
    }
  }, [discount]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDiscount.mutate({
      enabled,
      percentage,
      bannerText,
    });
  };

  return (
    <div className="space-y-6 text-sm max-w-2xl">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          SITE-WIDE DISCOUNT SETTINGS
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure active store-wide promotion banners and global discount rates.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-800">Enable Global Discount</div>
            <div className="text-[11px] text-slate-500">Apply discount percentage automatically at checkout</div>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Discount Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Promotion Banner Text
          </label>
          <input
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder="e.g. Special Summer Sale: Get 20% OFF all items!"
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={updateDiscount.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {updateDiscount.isPending ? 'Saving Discount...' : 'Save Discount Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}