'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  useUpdateAdminSecurity,
  useChangeAdminPassword,
} from '@/app/features/admin/hooks/admin-settings.hooks';
import {
  useSetupTwoFactor,
  useVerifyAndEnableTwoFactor,
  useDisableTwoFactor,
} from '@/app/features/admin/hooks/admin-auth.hooks';

interface SecurityTabProps {
  security?: {
    twoFactorEnabled: boolean;
    sessionTimeoutMin: number;
    lastPasswordChange: string | null;
  };
}

// 2FA sub-states driven by what the user has clicked
type TwoFAView = 'idle' | 'setup-qr' | 'setup-verify' | 'disable-confirm';

export default function SecurityTab({ security }: SecurityTabProps) {
  const updateSecurity = useUpdateAdminSecurity();
  const changePassword = useChangeAdminPassword();
  const setupTwoFactor = useSetupTwoFactor();
  const verifyAndEnable = useVerifyAndEnableTwoFactor();
  const disableTwoFactor = useDisableTwoFactor();

  // ── Session timeout (the only field updateSecurity accepts) ──
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState<number>(
    security?.sessionTimeoutMin ?? 30,
  );

  // ── Password ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── 2FA local UI state ──
  const [twoFAView, setTwoFAView] = useState<TwoFAView>('idle');
  // Holds the QR data returned from /admin/auth/setup
  const [qrData, setQrData] = useState<{
    qrCode: string;
    secret: string;
    manualEntryKey: string;
  } | null>(null);
  const [setupOtp, setSetupOtp] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableOtp, setDisableOtp] = useState('');

  useEffect(() => {
    if (security) {
      setSessionTimeoutMin(security.sessionTimeoutMin ?? 30);
    }
  }, [security]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveSecurity = () => {
    updateSecurity.mutate({ sessionTimeoutMin });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    changePassword.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  };

  // Step 1 — call /admin/auth/setup to get QR
  const handleStartSetup = async () => {
    setupTwoFactor.mutate(undefined, {
      onSuccess: (res) => {
        setQrData(res.data);
        setTwoFAView('setup-qr');
      },
    });
  };

  // Step 2 — user clicks "Next" after scanning QR
  const handleQrNext = () => {
    setSetupOtp('');
    setTwoFAView('setup-verify');
  };

  // Step 3 — user submits the OTP from their app to enable 2FA
  const handleVerifySetup = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndEnable.mutate(
      { token: setupOtp },
      {
        onSuccess: () => {
          setTwoFAView('idle');
          setQrData(null);
          setSetupOtp('');
        },
      },
    );
  };

  // Disable flow — user provides password + live OTP to disable
  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault();
    disableTwoFactor.mutate(
      { password: disablePassword, token: disableOtp },
      {
        onSuccess: () => {
          setTwoFAView('idle');
          setDisablePassword('');
          setDisableOtp('');
        },
      },
    );
  };

  const isTwoFAEnabled = security?.twoFactorEnabled ?? false;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 text-sm max-w-2xl">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          SECURITY SETTINGS
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage password, session timeout, and two-factor authentication.
        </p>
      </div>

      {/* ── Change Password ──────────────────────────────────────────────── */}
      <form
        onSubmit={handlePasswordChange}
        className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4"
      >
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Change Password
        </h3>

        {security?.lastPasswordChange && (
          <p className="text-[11px] text-slate-500">
            Last changed:{' '}
            {new Date(security.lastPasswordChange).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
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

      {/* ── Session Timeout ──────────────────────────────────────────────── */}
      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Session Timeout
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Auto-logout after
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
            <option value={480}>8 Hours</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSaveSecurity}
          disabled={updateSecurity.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {updateSecurity.isPending ? 'Saving...' : 'Save Session Settings'}
        </button>
      </div>

      {/* ── Two-Factor Authentication ────────────────────────────────────── */}
      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Two-Factor Authentication
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isTwoFAEnabled
                ? '2FA is active. Your account is protected with an authenticator app.'
                : 'Add an extra layer of security to your admin account.'}
            </p>
          </div>
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              isTwoFAEnabled
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isTwoFAEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* ── IDLE: show Enable or Disable button ── */}
        {twoFAView === 'idle' && (
          <>
            {!isTwoFAEnabled && (
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={setupTwoFactor.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                {setupTwoFactor.isPending ? 'Generating QR...' : 'Enable 2FA'}
              </button>
            )}
            {isTwoFAEnabled && (
              <button
                type="button"
                onClick={() => setTwoFAView('disable-confirm')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors"
              >
                Disable 2FA
              </button>
            )}
          </>
        )}

        {/* ── STEP 1: Show QR code to scan ── */}
        {twoFAView === 'setup-qr' && qrData && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Scan this QR code with <strong>Google Authenticator</strong>,{' '}
              <strong>Authy</strong>, or any TOTP app.
            </p>

            {/* QR image — backend returns a base64 data URL */}
            <div className="flex justify-center">
              <img
                src={qrData.qrCode}
                alt="2FA QR Code"
                width={180}
                height={180}
                className="rounded-lg border border-slate-200 shadow-sm"
              />
            </div>

            <div className="bg-slate-100 rounded-lg p-3 space-y-1">
              <p className="text-[11px] text-slate-500">
                Can&apos;t scan? Enter this key manually:
              </p>
              <p className="text-xs font-mono font-semibold text-slate-800 break-all">
                {qrData.manualEntryKey}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleQrNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors"
              >
                I&apos;ve Scanned — Enter Code
              </button>
              <button
                type="button"
                onClick={() => { setTwoFAView('idle'); setQrData(null); }}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Enter OTP to confirm setup ── */}
        {twoFAView === 'setup-verify' && (
          <form onSubmit={handleVerifySetup} className="space-y-4">
            <p className="text-xs text-slate-600">
              Enter the 6-digit code shown in your authenticator app to activate 2FA.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={setupOtp}
                onChange={(e) => setSetupOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-40 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={setupOtp.length !== 6 || verifyAndEnable.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                {verifyAndEnable.isPending ? 'Verifying...' : 'Activate 2FA'}
              </button>
              <button
                type="button"
                onClick={() => setTwoFAView('setup-qr')}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* ── DISABLE: Confirm with password + live OTP ── */}
        {twoFAView === 'disable-confirm' && (
          <form onSubmit={handleDisable} className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-red-700 font-medium">
                Enter your account password and a live OTP from your authenticator to disable 2FA.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Account Password
              </label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Authenticator Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableOtp}
                onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-40 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={
                  !disablePassword ||
                  disableOtp.length !== 6 ||
                  disableTwoFactor.isPending
                }
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
              >
                {disableTwoFactor.isPending ? 'Disabling...' : 'Confirm Disable 2FA'}
              </button>
              <button
                type="button"
                onClick={() => { setTwoFAView('idle'); setDisablePassword(''); setDisableOtp(''); }}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}