'use client';

import React, { useState, useEffect } from 'react';
import { 
  useUpdateAdminSecurity, 
  useChangeAdminPassword 
} from '@/app/features/admin/hooks/admin-settings.hooks';

interface SecurityTabProps {
  security?: {
    twoFactorEnabled: boolean;
    sessionTimeoutMin: number;
    ipWhitelist: string[];
    loginAlertsEnabled: boolean;
  };
}

const DEFAULT_SECURITY = {
  twoFactorEnabled: false,
  sessionTimeoutMin: 30,
  ipWhitelist: [],
  loginAlertsEnabled: true,
};

export default function SecurityTab({ security }: SecurityTabProps) {
  const updateSecurity = useUpdateAdminSecurity();
  const changePassword = useChangeAdminPassword();

  // ✅ Safe state initialization with fallbacks
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState<number>(
    security?.sessionTimeoutMin ?? DEFAULT_SECURITY.sessionTimeoutMin
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    security?.twoFactorEnabled ?? DEFAULT_SECURITY.twoFactorEnabled
  );
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState<boolean>(
    security?.loginAlertsEnabled ?? DEFAULT_SECURITY.loginAlertsEnabled
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ Keep state in sync when backend data loads asynchronously
  useEffect(() => {
    if (security) {
      setSessionTimeoutMin(security.sessionTimeoutMin ?? DEFAULT_SECURITY.sessionTimeoutMin);
      setTwoFactorEnabled(security.twoFactorEnabled ?? DEFAULT_SECURITY.twoFactorEnabled);
      setLoginAlertsEnabled(security.loginAlertsEnabled ?? DEFAULT_SECURITY.loginAlertsEnabled);
    }
  }, [security]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    changePassword.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  const handleSaveSecurity = () => {
    updateSecurity.mutate({
      twoFactorEnabled,
      sessionTimeoutMin,
      loginAlertsEnabled,
    });
  };

  return (
    <div className="space-y-8 text-sm max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          SECURITY SETTINGS
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage administrative authentication, sessions, and password credentials.
        </p>
      </div>

      {/* Password Change Form */}
      <form onSubmit={handlePasswordChange} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Change Password</h3>
        
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={changePassword.isPending}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
        >
          {changePassword.isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {/* Session & Auth Configuration */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Session Timeout (Minutes)
          </label>
          <select
            value={sessionTimeoutMin}
            onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={60}>1 Hour</option>
            <option value={120}>2 Hours</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSaveSecurity}
            disabled={updateSecurity.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {updateSecurity.isPending ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}