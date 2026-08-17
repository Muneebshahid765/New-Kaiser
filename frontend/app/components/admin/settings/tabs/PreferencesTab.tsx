'use client';

import React, { useState, useEffect } from 'react';
import {
  useUpdateAdminPreferences,
  useUpdateAdminTheme,
} from '@/app/features/admin/hooks/admin-settings.hooks';
import type {
  CurrencyCode,
  LanguageCode,
  DateFormatType,
  ThemeMode,
} from '@/app/features/admin/schemas/admin-settings.schemas';

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

  const [currency, setCurrency] = useState<CurrencyCode>(preferences?.currency ?? 'USD');
  const [language, setLanguage] = useState<LanguageCode>(preferences?.language ?? 'en');
  const [timezoneAuto, setTimezoneAuto] = useState<boolean>(preferences?.timezoneAuto ?? true);
  const [timezoneManual, setTimezoneManual] = useState<string>(
    preferences?.timezoneManual ?? '+05:00',
  );
  const [dateFormat, setDateFormat] = useState<DateFormatType>(
    preferences?.dateFormat ?? 'DMY',
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(theme?.mode ?? 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    theme?.sidebarCollapsed ?? false,
  );

  useEffect(() => {
    if (preferences) {
      setCurrency(preferences.currency);
      setLanguage(preferences.language);
      setTimezoneAuto(preferences.timezoneAuto);
      setTimezoneManual(preferences.timezoneManual);
      setDateFormat(preferences.dateFormat);
    }
    if (theme) {
      setThemeMode(theme.mode);
      setSidebarCollapsed(theme.sidebarCollapsed);
    }
  }, [preferences, theme]);

  const handleSave = async () => {
    // Fire both in parallel — independent endpoints
    await Promise.all([
      updatePreferences.mutateAsync({
        prefCurrency: currency,
        prefLanguage: language,
        prefTimezoneAuto: timezoneAuto,
        prefTimezoneManual: timezoneManual,
        prefDateFormat: dateFormat,
      }),
      updateTheme.mutateAsync({
        mode: themeMode,
        sidebarCollapsed,
      }),
    ]);
  };

  const isSaving = updatePreferences.isPending || updateTheme.isPending;

  return (
    <div className="space-y-8 text-sm">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          PREFERENCES
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure locale, display, and theme settings for your admin panel.
        </p>
      </div>

      {/* ── Locale & Regional ─────────────────────────────────────────── */}
      <section className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Locale & Regional
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="PKR">PKR (Rs)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as DateFormatType)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DMY">DD/MM/YYYY</option>
              <option value="MDY">MM/DD/YYYY</option>
              <option value="YMD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-medium">Auto-detect Timezone</span>
            <button
              type="button"
              onClick={() => setTimezoneAuto(!timezoneAuto)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                timezoneAuto ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow" />
            </button>
          </div>
          {!timezoneAuto && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Manual Timezone Offset
              </label>
              <input
                type="text"
                value={timezoneManual}
                onChange={(e) => setTimezoneManual(e.target.value)}
                placeholder="+05:00"
                className="w-40 border border-slate-300 rounded px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Theme ─────────────────────────────────────────────────────── */}
      <section className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Appearance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Theme Mode
            </label>
            <select
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">Collapse Sidebar by Default</span>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  sidebarCollapsed ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}