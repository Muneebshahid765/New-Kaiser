'use client';

import React, { useState, useEffect } from 'react';
import {
  useUpdateAdminProfile,
  useUploadAdminProfilePicture,
} from '@/app/features/admin/hooks/admin-settings.hooks';

interface ProfileTabProps {
  profile?: {
    name: string;
    email: string;
    profilePicture: string | null;
  };
  security?: {
    twoFactorEnabled: boolean;
  };
}

// Backend serves files at /uploads/... — prepend API base URL
function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? '';
  return `${base}${path}`;
}

export default function ProfileTab({ profile, security }: ProfileTabProps) {
  const updateProfile = useUpdateAdminProfile();
  const uploadPicture = useUploadAdminProfilePicture();

  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    resolveImageUrl(profile?.profilePicture ?? null),
  );

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setPreviewUrl(resolveImageUrl(profile.profilePicture ?? null));
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately before upload
    setPreviewUrl(URL.createObjectURL(file));

    uploadPicture.mutate(file, {
      onSuccess: (res) => {
        // Replace blob URL with real server path once upload completes
        setPreviewUrl(resolveImageUrl(res.profilePicture));
      },
      onError: () => {
        // Revert preview on failure
        setPreviewUrl(resolveImageUrl(profile?.profilePicture ?? null));
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { name?: string; email?: string } = {};
    if (name.trim() && name.trim() !== profile?.name) payload.name = name.trim();
    if (email.trim() && email.trim() !== profile?.email) payload.email = email.trim();
    if (!payload.name && !payload.email) return;
    updateProfile.mutate(payload);
  };

  return (
    <div className="space-y-8 text-sm max-w-2xl">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          ADMIN PROFILE
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account name, email, and profile photo.
        </p>
      </div>

      {/* ── Avatar ──────────────────────────────────────────────────────── */}
      <section className="flex items-center space-x-6 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
        <div className="relative w-20 h-20 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-teal-800 text-white font-bold text-2xl uppercase">
              {name ? name.charAt(0) : 'A'}
            </div>
          )}
          {uploadPicture.isPending && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-[10px]">Uploading...</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-800">Profile Photo</h3>
            <p className="text-[11px] text-slate-500">JPG, PNG or WEBP · Max 5MB</p>
          </div>
          <label className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 shadow-sm cursor-pointer transition-colors">
            <span>{uploadPicture.isPending ? 'Uploading...' : 'Change Photo'}</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadPicture.isPending}
            />
          </label>
        </div>
      </section>

      {/* ── Profile form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@domain.com"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-xs"
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-medium text-blue-900">Account Security Status</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
            {security?.twoFactorEnabled ? '2FA Active' : 'Standard Protection'}
          </span>
        </div>

        <div className="pt-2 flex items-center space-x-3">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={() => {
              setName(profile?.name ?? '');
              setEmail(profile?.email ?? '');
            }}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}