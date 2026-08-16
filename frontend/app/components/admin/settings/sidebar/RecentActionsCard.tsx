'use client';

import React from 'react';
import { useSystemActivityAndHealth } from '@/app/features/admin/hooks/admin-settings.hooks';

export default function RecentActionsCard() {
  const { data, isLoading } = useSystemActivityAndHealth();

  if (isLoading) {
    return <div className="p-4 bg-white rounded-lg border text-xs text-slate-400">Loading activity...</div>;
  }

  const actions = data?.recentActions || [];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <h3 className="text-xs font-bold text-slate-800">Recent Admin Actions</h3>

      <div className="space-y-3 relative pl-2 border-l border-slate-200">
        {actions.map((act) => (
          <div key={act.id} className="text-xs relative pl-3">
            <span className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-slate-400"></span>
            <p className="text-slate-800 font-medium">{act.action}</p>
            <p className="text-[10px] text-slate-400">Recent activity</p>
          </div>
        ))}
      </div>
    </div>
  );
}