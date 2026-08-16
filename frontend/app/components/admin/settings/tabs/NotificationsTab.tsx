'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateAdminNotifications } from '@/app/features/admin/hooks/admin-settings.hooks';

interface NotificationsTabProps {
  notifications?: {
    emailAlerts: boolean;
    orderUpdates: boolean;
    securityAlerts: boolean;
    systemLogs: boolean;
    marketingEmails: boolean;
  };
}

const DEFAULT_NOTIFICATIONS = {
  emailAlerts: true,
  orderUpdates: true,
  securityAlerts: true,
  systemLogs: false,
  marketingEmails: false,
};

export default function NotificationsTab({ notifications }: NotificationsTabProps) {
  const updateNotifications = useUpdateAdminNotifications();

  // ✅ Safe state initialization with default fallback object
  const [state, setState] = useState(notifications ?? DEFAULT_NOTIFICATIONS);

  // ✅ Keep state in sync when backend data arrives asynchronously
  useEffect(() => {
    if (notifications) {
      setState(notifications);
    }
  }, [notifications]);

  const toggle = (key: keyof typeof DEFAULT_NOTIFICATIONS) => {
    setState((prev) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  const handleSave = () => {
    updateNotifications.mutate(state);
  };

  const items: { key: keyof typeof DEFAULT_NOTIFICATIONS; label: string; desc: string }[] = [
    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical notification summaries via email.' },
    { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified for high-value orders and refund requests.' },
    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Get alerts for suspicious logins and 2FA changes.' },
    { key: 'systemLogs', label: 'System Logs', desc: 'Receive periodic system health and API status digests.' },
    { key: 'marketingEmails', label: 'Marketing Communications', desc: 'Receive product update newsletters and tips.' },
  ];

  return (
    <div className="space-y-6 text-sm max-w-2xl">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          NOTIFICATION PREFERENCES
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Control what system notifications and admin alerts you receive.
        </p>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-slate-800">{item.label}</div>
              <div className="text-[11px] text-slate-500">{item.desc}</div>
            </div>

            <button
              type="button"
              onClick={() => toggle(item.key)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 ${
                state?.[item.key] ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={updateNotifications.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
        >
          {updateNotifications.isPending ? 'Saving Preferences...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}