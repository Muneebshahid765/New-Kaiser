'use client';

import React, { useState, useEffect } from 'react';
import { 
  useUpdateAdminProfile, 
  useUploadAdminProfilePicture 
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

export default function ProfileTab({ profile, security }: ProfileTabProps) {
  const updateProfile = useUpdateAdminProfile();
  const uploadPicture = useUploadAdminProfilePicture();

  // ✅ Safe state initialization using optional chaining and fallbacks
  const [name, setName] = useState<string>(profile?.name ?? '');
  const [email, setEmail] = useState<string>(profile?.email ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.profilePicture ?? null);

  // ✅ Sync local input states when backend data arrives asynchronously
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setPreviewUrl(profile.profilePicture ?? null);
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      uploadPicture.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    updateProfile.mutate({
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="space-y-8 text-sm max-w-2xl">
      <div>
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
          ADMIN PROFILE SETTINGS
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account information, profile avatar, and administrative account identity.
        </p>
      </div>

      <section className="flex items-center space-x-6 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
        <div className="relative w-20 h-20 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Admin Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-teal-800 text-white font-bold text-2xl uppercase">
              {name ? name.charAt(0) : 'A'}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-800">Profile Photo</h3>
            <p className="text-[11px] text-slate-500">
              Supports JPG, PNG or WEBP (Max 2MB).
            </p>
          </div>

          <label className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 shadow-sm cursor-pointer transition-colors">
            <span>{uploadPicture.isPending ? 'Uploading Avatar...' : 'Change Photo'}</span>
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
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
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
            {updateProfile.isPending ? 'Saving Changes...' : 'Save Profile'}
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