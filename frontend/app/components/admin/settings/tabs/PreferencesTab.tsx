'use client';

import React, { useState } from 'react';
import { useUpdateAdminPreferences, useUpdateAdminTheme } from '@/app/features/admin/hooks/admin-settings.hooks';
import type { CurrencyCode, LanguageCode, DateFormatType, ThemeMode } from '@/app/features/admin/types/admin-settings.types';

interface PreferencesTabProps {
  preferences?: {
    currency: CurrencyCode;
    language: LanguageCode;
    timezoneAuto: boolean;
    timezoneManual: string;
    dateFormat: DateFormatType;
  };
  theme?: {
    mode: ThemeMode;
    sidebarCollapsed: boolean;
  };
}

export default function PreferencesTab({ preferences, theme }: PreferencesTabProps) {
  const updatePreferences = useUpdateAdminPreferences();
  const updateTheme = useUpdateAdminTheme();

  // ✅ Added Optional Chaining (?. ) and Fallback Defaults to prevent crashes
  const [currency, setCurrency] = useState<CurrencyCode>(preferences?.currency ?? 'USD');
  const [language, setLanguage] = useState<LanguageCode>(preferences?.language ?? 'en');
  const [timezoneAuto, setTimezoneAuto] = useState<boolean>(preferences?.timezoneAuto ?? true);
  const [timezoneManual, setTimezoneManual] = useState<string>(preferences?.timezoneManual ?? '+05:00');
  const [dateFormat, setDateFormat] = useState<DateFormatType>(preferences?.dateFormat ?? 'DMY');

  const [themeMode, setThemeMode] = useState<ThemeMode>(theme?.mode ?? 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(theme?.sidebarCollapsed ?? false);

  const handleSave = async () => {
    await updatePreferences.mutateAsync({
      prefCurrency: currency,
      prefLanguage: language,
      prefTimezoneAuto: timezoneAuto,
      prefTimezoneManual: timezoneManual,
      prefDateFormat: dateFormat,
    });

    await updateTheme.mutateAsync({
      mode: themeMode,
      sidebarCollapsed: sidebarCollapsed,
    });
  };

  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">PREFERENCES</h2>
        <div className="text-xs font-semibold text-slate-800">Locale & Regional</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="PKR">PKR (Rs)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Preferred Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="en">English (en)</option>
              <option value="ur">Urdu (ur)</option>
              <option value="es">Spanish (es)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Timezone Target</label>
            <input
              type="text"
              disabled={timezoneAuto}
              value={timezoneAuto ? 'Auto-Detected' : timezoneManual}
              onChange={(e) => setTimezoneManual(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <span className="text-xs text-slate-600 font-medium">Auto Timezone Mode</span>
          <button
            type="button"
            onClick={() => setTimezoneAuto(!timezoneAuto)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              timezoneAuto ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="bg-white w-4 h-4 rounded-full shadow"></span>
          </button>
        </div>
      </section>

      <div className="pt-4 flex space-x-3">
        <button
          onClick={handleSave}
          disabled={updatePreferences.isPending || updateTheme.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}