'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations/translations';

interface HeaderNavLinksProps {
  isMobileMenuOpen: boolean;
  activePath: string;
  categoryDropdownRef?: React.RefObject<HTMLLIElement | null>;
  onCategoryMouseEnter?: () => void;
  onCategoryMouseLeave?: () => void;
}

export const HeaderNavLinks: React.FC<HeaderNavLinksProps> = ({
  isMobileMenuOpen,
  activePath,
  categoryDropdownRef,
  onCategoryMouseEnter,
  onCategoryMouseLeave,
}) => {
  const { language } = useLanguage();

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'products', href: '/products', hasCategoryDropdown: true },
    { key: 'about', href: '/about' },
    { key: 'Faq', href: '/faq' },
    { key: 'contact', href: '/contact' },
  ];

  return (
    <>
      {navItems.map((item) => {
        const isActive = activePath === item.href;
        const label = t(item.key, language);

        return (
          <li
            key={item.href}
            className={
              isMobileMenuOpen
                ? 'border-b border-white/10 p-0'
                : item.hasCategoryDropdown
                ? 'relative'
                : ''
            }
            ref={item.hasCategoryDropdown ? categoryDropdownRef : undefined}
            onMouseEnter={item.hasCategoryDropdown ? onCategoryMouseEnter : undefined}
            onMouseLeave={item.hasCategoryDropdown ? onCategoryMouseLeave : undefined}
          >
            <Link
              href={item.href}
              className={`text-slate-900 no-underline font-medium relative transition-colors ${
                isMobileMenuOpen
                  ? `text-white text-base block px-5 py-4 transition-all ${
                      isActive
                        ? 'bg-orange-500/15 text-orange-500 pl-7'
                        : 'hover:bg-orange-500/15 hover:text-orange-500 hover:pl-7'
                    }`
                  : `hover:text-[#966629] ${isActive ? 'text-[#966629]' : ''}`
              }`}
            >
              {label}
              {!isMobileMenuOpen && (
                <span
                  className={`absolute left-0 -bottom-1.5 w-0 h-[2px] bg-gradient-to-r from-[#c08b4a] to-[#8a5b23] transition-all ${
                    isActive ? 'w-full' : 'hover:w-full'
                  }`}
                />
              )}
            </Link>
          </li>
        );
      })}
    </>
  );
};