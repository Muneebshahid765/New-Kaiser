'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateSiteWideDiscount } from '@/app/features/admin/hooks/admin-settings.hooks';

interface DiscountTabProps {
  discount?: {
    enabled: boolean;
    percentage: number;
    bannerText: string;
    startDate: string | null;
    endDate: string | null;
  };
}

const DEFAULT = {
  enabled: false,
  percentage: 0,
  bannerText: '',
  startDate: null as string | null,
  endDate: null as string | null,
};

// Convert ISO date string → value for <input type="datetime-local">
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

// Convert datetime-local value → ISO string (or null when empty)
function fromDatetimeLocal(val: string): string | null {
  if (!val) return null;
  return new Date(val).toISOString();
}

export default function DiscountTab({ discount }: DiscountTabProps) {
  const updateDiscount = useUpdateSiteWideDiscount();

  const [enabled, setEnabled] = useState(discount?.enabled ?? DEFAULT.enabled);
  const [percentage, setPercentage] = useState(discount?.percentage ?? DEFAULT.percentage);
  const [bannerText, setBannerText] = useState(discount?.bannerText ?? DEFAULT.bannerText);
  const [startDate, setStartDate] = useState<string>(
    toDatetimeLocal(discount?.startDate ?? null),
  );
  const [endDate, setEndDate] = useState<string>(
    toDatetimeLocal(discount?.endDate ?? null),
  );

  useEffect(() => {
    if (discount) {
      setEnabled(discount.enabled);
      setPercentage(discount.percentage);
      setBannerText(discount.bannerText);
      setStartDate(toDatetimeLocal(discount.startDate));
      setEndDate(toDatetimeLocal(discount.endDate));
    }
  }, [discount]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDiscount.mutate({
      enabled,
      percentage,
      bannerText,
      startDate: fromDatetimeLocal(startDate),
      endDate: fromDatetimeLocal(endDate),
    });
  };

  return (
    <div className="space-y-6 text-sm max-w-2xl">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          SITE-WIDE DISCOUNT
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure a global promotion applied automatically at checkout.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm"
      >
        {/* Enable toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-800">Enable Global Discount</div>
            <div className="text-[11px] text-slate-500">
              Apply discount percentage automatically at checkout
            </div>
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

        {/* Percentage */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Discount Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Banner text */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Promotion Banner Text
            <span className="text-slate-400 font-normal ml-1">
              ({bannerText.length}/120)
            </span>
          </label>
          <input
            type="text"
            maxLength={120}
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder="e.g. Summer Sale: Get 20% OFF everything!"
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Start Date / Time
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              End Date / Time
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear dates shortcut */}
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-[11px] text-slate-500 underline hover:text-slate-700"
          >
            Clear dates (discount runs indefinitely)
          </button>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={updateDiscount.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {updateDiscount.isPending ? 'Saving...' : 'Save Discount Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}