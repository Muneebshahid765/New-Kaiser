'use client';

import React, { useState, useEffect } from 'react';
import { useUpdateAdminNotifications } from '@/app/features/admin/hooks/admin-settings.hooks';
import type { UpdateNotificationsPayload } from '@/app/features/admin/schemas/admin-settings.schemas';

// Field names must match backend NotificationsResponse exactly
interface NotificationsTabProps {
  notifications?: {
    emailAlerts: boolean;
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    customerAlerts: boolean;
    systemAlerts: boolean;
  };
}

const DEFAULT_NOTIFICATIONS: Required<UpdateNotificationsPayload> = {
  emailAlerts: true,
  orderAlerts: true,
  lowStockAlerts: true,
  customerAlerts: false,
  systemAlerts: true,
};

const ITEMS: {
  key: keyof UpdateNotificationsPayload;
  label: string;
  desc: string;
}[] = [
  {
    key: 'emailAlerts',
    label: 'Email Alerts',
    desc: 'Receive critical notification summaries via email.',
  },
  {
    key: 'orderAlerts',
    label: 'Order Alerts',
    desc: 'Get notified for new orders, status changes, and refund requests.',
  },
  {
    key: 'lowStockAlerts',
    label: 'Low Stock Alerts',
    desc: 'Receive warnings when product inventory drops below threshold.',
  },
  {
    key: 'customerAlerts',
    label: 'Customer Alerts',
    desc: 'Get alerts for new customer registrations and account activity.',
  },
  {
    key: 'systemAlerts',
    label: 'System Alerts',
    desc: 'Receive periodic system health and API status digests.',
  },
];

export default function NotificationsTab({ notifications }: NotificationsTabProps) {
  const updateNotifications = useUpdateAdminNotifications();

  const [state, setState] = useState<Required<UpdateNotificationsPayload>>(
    notifications ?? DEFAULT_NOTIFICATIONS,
  );

  useEffect(() => {
    if (notifications) {
      setState({
        emailAlerts: notifications.emailAlerts,
        orderAlerts: notifications.orderAlerts,
        lowStockAlerts: notifications.lowStockAlerts,
        customerAlerts: notifications.customerAlerts,
        systemAlerts: notifications.systemAlerts,
      });
    }
  }, [notifications]);

  const toggle = (key: keyof UpdateNotificationsPayload) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateNotifications.mutate(state);
  };

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
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-slate-800">{item.label}</div>
              <div className="text-[11px] text-slate-500">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 ${
                state[item.key]
                  ? 'bg-teal-700 justify-end'
                  : 'bg-slate-300 justify-start'
              }`}
              aria-label={`Toggle ${item.label}`}
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
          {updateNotifications.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}