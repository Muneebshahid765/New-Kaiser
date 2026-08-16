'use client';

import React from 'react';
import { useSystemActivityAndHealth } from '@/app/features/admin/hooks/admin-settings.hooks';

export default function SystemStatusCard() {
  const { data } = useSystemActivityAndHealth();

  const health = data?.systemStatus || {
    database: 'Connected',
    paymentGateway: 'Connected',
    emailService: 'Active',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
      <div className="flex items-center space-x-1">
        <h3 className="text-xs font-bold text-slate-800">System Status</h3>
        <span className="text-slate-400 text-xs">ⓘ</span>
      </div>

      <ul className="space-y-2">
        <li className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Database:</span>
          <span className="text-slate-800 font-medium">{health.database}</span>
        </li>
        <li className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Payment Gateway:</span>
          <span className="text-slate-800 font-medium">{health.paymentGateway}</span>
        </li>
        <li className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Email Service:</span>
          <span className="text-slate-800 font-medium">{health.emailService}</span>
        </li>
      </ul>
    </div>
  );
}