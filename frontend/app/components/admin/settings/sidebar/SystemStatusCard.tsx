// features/admin/components/SystemActivitySidebar.tsx
'use client';

import React from 'react';
import { useSystemActivityAndHealth } from '@/app/features/admin/hooks/admin-settings.hooks';

const ACTIVE_STATUSES = new Set(['Connected', 'Active', 'Online', 'OK']);

function statusColor(value: string): string {
  const upper = value?.toUpperCase() ?? '';
  if (ACTIVE_STATUSES.has(value) || upper === 'CONNECTED' || upper === 'ACTIVE') {
    return 'bg-emerald-500';
  }
  if (upper === 'DEGRADED' || upper === 'SLOW') return 'bg-amber-400';
  return 'bg-red-500';
}

function timeAgo(date: string | Date | null): string {
  if (!date) return 'Unknown time';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function SystemActivitySidebar() {
  const { data, isLoading, isError } = useSystemActivityAndHealth();

  // Handle nested interceptor payload structure automatically
  const payload = (data as any)?.data ?? data;
  const actions = payload?.recentActions ?? [];
  const health = payload?.systemStatus ?? {
    database: 'Checking...',
    paymentGateway: 'Checking...',
    emailService: 'Checking...',
  };

  return (
    <div className="space-y-6">
      <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        System Alerts & Actions
      </div>

      {/* --- Recent Admin Actions Card --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800">Recent Admin Actions</h3>

        {isLoading ? (
          <div className="text-xs text-slate-400 animate-pulse">Loading activity...</div>
        ) : isError ? (
          <div className="text-xs text-red-400">Could not load activity.</div>
        ) : actions.length === 0 ? (
          <p className="text-[11px] text-slate-400">No recent actions recorded.</p>
        ) : (
          <div className="space-y-3 relative pl-2 border-l border-slate-200">
            {actions.map((act: any) => (
              <div key={act.id} className="text-xs relative pl-3">
                <span className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-slate-400" />
                <p className="text-slate-800 font-medium leading-snug">{act.action}</p>
                <p className="text-[10px] text-slate-400">{timeAgo(act.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- System Status Card --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">System Status</h3>
          {isLoading && (
            <span className="text-[10px] text-slate-400 animate-pulse">Checking...</span>
          )}
        </div>

        <ul className="space-y-2">
          {[
            { label: 'Database', value: health.database },
            { label: 'Payment Gateway', value: health.paymentGateway },
            { label: 'Email Service', value: health.emailService },
          ].map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${statusColor(value)}`} />
                <span className="text-slate-600">{label}</span>
              </div>
              <span className="text-slate-800 font-medium">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}