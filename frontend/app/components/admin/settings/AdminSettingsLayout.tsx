'use client';

import React, { useState } from 'react';
import { useAdminSettings } from '@/app/features/admin/hooks/admin-settings.hooks';
import ProfileTab from './tabs/ProfileTab';
import PreferencesTab from './tabs/PreferencesTab';
import NotificationsTab from './tabs/NotificationsTab';
import SecurityTab from './tabs/SecurityTab';
import DiscountTab from './tabs/DiscountTab';
import RecentActionsCard from './sidebar/RecentActionsCard';
import ActiveDiscountCard from './sidebar/ActiveDiscountCard';
import SystemStatusCard from './sidebar/SystemStatusCard';

type TabType = 'profile' | 'preferences' | 'notifications' | 'security' | 'discount';

export default function AdminSettingsLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('preferences');
  const { data: settings, isLoading, isError } = useAdminSettings();

  if (isLoading) {
    return (
      <div className="p-10 text-center text-slate-500 font-medium animate-pulse">
        Loading Global System Configuration...
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="p-10 text-center text-red-500 font-medium">
        Failed to fetch admin settings. Please refresh or verify authorization.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6">
      <header className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-800">Global System Configuration</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Options Form Tabs */}
        <div className="lg:col-span-8 space-y-0">
          <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl shadow-sm space-x-6 text-sm">
            {(['profile', 'preferences', 'notifications', 'security', 'discount'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 capitalize transition-colors border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 shadow-sm">
            {activeTab === 'profile' && <ProfileTab profile={settings.profile} />}
            {activeTab === 'preferences' && <PreferencesTab preferences={settings.preferences} theme={settings.theme} />}
            {activeTab === 'notifications' && <NotificationsTab notifications={settings.notifications} />}
            {activeTab === 'security' && <SecurityTab security={settings.security} />}
            {activeTab === 'discount' && <DiscountTab discount={settings.siteWideDiscount} />}
          </div>
        </div>

        {/* Right Sidebar Status Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">SYSTEM ALERTS & ACTIONS</div>
          <RecentActionsCard />
          <ActiveDiscountCard discount={settings.siteWideDiscount} />
          <SystemStatusCard />
        </div>
      </div>
    </div>
  );
}