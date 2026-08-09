'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UtilityItem {
  label: string;
  icon: React.ElementType;
  color: string;
  glow: string;
}

const utilityItemsLeft: UtilityItem[] = [
  { label: '+27 11 123 4567', icon: Phone, color: '#00c6ff', glow: 'rgba(0,198,255,0.35)' },
  { label: 'info@africakaiser.com', icon: Mail, color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
  { label: 'Johannesburg, South Africa', icon: MapPin, color: '#f472b6', glow: 'rgba(244,114,182,0.35)' },
];

const hexToRgb = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

export const HeaderUtilityBar: React.FC = () => {
  const { isEnglish, toggleLanguage } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#111c2e] to-[#0f172a] text-slate-200 flex items-center justify-between gap-3 py-1.5 px-[clamp(16px,4vw,48px)] text-sm relative z-[2]">
      <div className="flex items-center flex-wrap gap-4">
        {utilityItemsLeft.map(({ label, icon: Icon, color, glow }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: `rgba(${hexToRgb(color)}, 0.12)`,
                border: `1px solid ${color}44`,
                boxShadow: `0 0 8px ${glow}`,
              }}
            >
              <Icon size={13} color={color} strokeWidth={2} />
            </span>
            {label}
          </span>
        ))}
      </div>

      <div className="flex items-center flex-wrap gap-4">
        <span className="text-slate-300 font-semibold hidden sm:inline">
          Quality Materials for Africa
        </span>
        <div className="relative" ref={languageDropdownRef}>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/35 bg-white/8 text-white font-semibold cursor-pointer transition-all hover:bg-white/16 hover:border-white/55 text-xs"
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            title="Change Language"
          >
            <Globe size={14} color="#00c6ff" strokeWidth={2} />
            <span>{isEnglish ? 'EN' : 'PT'}</span>
          </button>
          {isLanguageDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[190px] p-3.5 rounded-2xl bg-[#0a1223]/95 border border-white/12 shadow-[0_18px_45px_rgba(5,9,18,0.65)] backdrop-blur-sm text-slate-100 z-[2000]">
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-slate-200 text-xs ${
                  isEnglish ? 'bg-orange-500/20 text-white' : 'hover:bg-orange-500/20 hover:text-white'
                }`}
                onClick={() => {
                  if (!isEnglish) toggleLanguage();
                  setIsLanguageDropdownOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">🇬🇧</span>
                  <span>English</span>
                </span>
                {isEnglish && <Check size={13} color="#00c6ff" strokeWidth={2.5} />}
              </div>
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-slate-200 text-xs ${
                  !isEnglish ? 'bg-orange-500/20 text-white' : 'hover:bg-orange-500/20 hover:text-white'
                }`}
                onClick={() => {
                  if (isEnglish) toggleLanguage();
                  setIsLanguageDropdownOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">🇵🇹</span>
                  <span>Português</span>
                </span>
                {!isEnglish && <Check size={13} color="#a78bfa" strokeWidth={2.5} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};