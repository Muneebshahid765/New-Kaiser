'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useGetAuth } from '@/context/auth-context';
import {
  useAdminSettings,
  usePublicDiscount,
} from '../app/features/admin/hooks/admin-settings.hooks';
import { useCategories } from '../app/features/categories/hooks/category.hooks';
import CategoryMegaDropdown from './CategoryDropDown';

import { HeaderUtilityBar } from './HeaderUtilityBar';
import { HeaderDiscountBanner } from './HeaderDiscountBanner';
import { HeaderNavLinks } from './HeaderNavLinks';

// Shadcn UI components integration
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { CategoryListItem } from '@/app/features/categories/types/category-reponse.types';


const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isEnglish, setLanguage } = useLanguage();

  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [activePath, setActivePath] = useState<string>('');
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  const categoryDropdownRef = useRef<HTMLLIElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: rawUser, isLoading: isAuthLoading } = useGetAuth();
  const user = (rawUser as any)?.data?.data || (rawUser as any)?.data || rawUser;

  const { data: settings, isLoading: isSettingsLoading } = useAdminSettings();
  const { data: publicDiscount } = usePublicDiscount();
  const { data: rawCategories } = useCategories();

  const categoriesList: CategoryListItem[] = Array.isArray(rawCategories)
  ? rawCategories
  : Array.isArray((rawCategories as any)?.data)
  ? (rawCategories as any).data
  : Array.isArray((rawCategories as any)?.categories)
  ? (rawCategories as any).categories
  : [];

  const isAdmin = user?.role === 'admin';
  const isBuyer = user?.role === 'buyer';

  const updateCartCount = useCallback(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalCount = savedCart.reduce(
        (total: number, item: { quantity?: number }) => total + (item.quantity || 1),
        0
      );
      setCartItemsCount(totalCount);
    } catch {
      setCartItemsCount(0);
    }
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight + 41);
    }
  }, [isSticky]);

  useEffect(() => {
    updateCartCount();
    const handleCartUpdate = () => updateCartCount();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateCartCount]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActivePath(pathname);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleCategoryMouseEnter = () => {
    if (window.innerWidth > 1023) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setIsCategoryDropdownOpen(true);
    }
  };

  const handleCategoryMouseLeave = () => {
    if (window.innerWidth > 1023) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsCategoryDropdownOpen(false);
      }, 100);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const activeCategories = categoriesList.filter(
  (cat) => cat.status === 'active' && cat.slug !== 'uncategorized'
);

  const profilePicturePath = settings?.profile?.profilePicture;

  const getUserInitials = (name = '') => {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'AK'
    );
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[999] transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      <div className="sticky top-0 z-[1000] w-full shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        {/* Component 1: Utility Bar */}
        <HeaderUtilityBar />

        {/* Component 2: Main Header Navbar */}
        <header
          ref={headerRef}
          className={`bg-white flex items-center justify-between px-[clamp(16px,4vw,48px)] py-[18px] transition-shadow relative z-[1] ${
            isSticky ? 'shadow-[0_10px_40px_rgba(15,23,42,0.12)]' : ''
          }`}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none"
            onClick={() => router.push('/')}
          >
            <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-[#c08b4a] to-[#8a5b23] flex items-center justify-center text-white font-bold text-base shadow-[0_8px_24px_rgba(249,115,22,0.4)]">
              AK
            </div>
            <div className="flex flex-col leading-[1.3]">
              <h1 className="m-0 text-lg text-slate-900 font-bold">Africa Kaiser</h1>
              <p className="m-0 text-sm text-slate-600">Electrical &amp; Building Materials</p>
            </div>
          </div>

          {/* Mobile Cart & Hamburger Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link
              href="/cart"
              className="relative inline-flex p-2 rounded-lg transition-colors hover:bg-orange-500/10"
            >
              <ShoppingCart size={24} className="text-slate-900" />
              {cartItemsCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1.5 -right-2 h-5 min-w-5 p-0 px-1 text-[10px] bg-gradient-to-br from-[#c08b4a] to-[#8a5b23] border-none"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-[5px]">
                <span
                  className={`w-[26px] h-[2px] bg-slate-900 transition-all ${
                    isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`w-[26px] h-[2px] bg-slate-900 transition-all ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`w-[26px] h-[2px] bg-slate-900 transition-all ${
                    isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''
                  }`}
                />
              </div>
            </Button>
          </div>

          {/* Desktop & Mobile Dynamic Nav */}
          <nav
            className={`flex-1 flex justify-end lg:justify-end ${
              isMobileMenuOpen
                ? 'fixed inset-0 bg-gradient-to-br from-[rgba(15,23,42,0.98)] to-[rgba(17,28,46,0.98)] backdrop-blur-[10px] p-6 flex-col z-[1000] overflow-y-auto translate-x-0 transition-transform duration-[0.4s]'
                : 'hidden lg:flex'
            }`}
          >
            {isMobileMenuOpen && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-5 right-5 bg-orange-500/20 border-2 border-orange-500/40 rounded-full hover:bg-orange-500/30"
                  onClick={toggleMobileMenu}
                >
                  <X size={20} className="text-white" />
                </Button>
                <div
                  className="flex items-center gap-3.5 p-5 mb-6 cursor-pointer border-b-2 border-orange-500/30"
                  onClick={() => {
                    router.push('/');
                    toggleMobileMenu();
                  }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8a4c] to-[#f97316] flex items-center justify-center text-white font-bold text-lg shadow-[0_8px_24px_rgba(249,115,22,0.5)]">
                    AK
                  </div>
                  <div className="flex flex-col leading-[1.3]">
                    <h1 className="m-0 text-[1.3rem] text-white font-bold">Africa Kaiser</h1>
                    <p className="m-0 text-sm text-white/70">Electrical &amp; Building Materials</p>
                  </div>
                </div>
              </>
            )}

            <ul
              className={
                isMobileMenuOpen
                  ? 'flex flex-col items-stretch gap-0 w-full max-w-[400px] my-[30px] mx-0'
                  : 'flex items-center gap-[22px] list-none m-0 p-0'
              }
            >
              {/* Component 3: Clean Nav Links */}
              <HeaderNavLinks
                isMobileMenuOpen={isMobileMenuOpen}
                activePath={activePath}
                categoryDropdownRef={categoryDropdownRef}
                onCategoryMouseEnter={handleCategoryMouseEnter}
                onCategoryMouseLeave={handleCategoryMouseLeave}
              />

              {/* Cart & Profile Menu */}
              <li
                className={
                  isMobileMenuOpen
                    ? 'flex flex-row gap-6 p-5 border-t border-white/10 mt-3'
                    : 'inline-flex items-center gap-4'
                }
              >
                <Link
                  href="/cart"
                  className={`relative inline-flex ${isMobileMenuOpen ? 'hidden' : ''} ${
                    activePath === '/cart' ? 'text-[#966629]' : 'text-slate-900'
                  }`}
                >
                  <ShoppingCart size={26} color="currentColor" />
                  {cartItemsCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-1.5 -right-2 h-5 min-w-5 p-0 px-1 text-[10px] bg-gradient-to-br from-[#c08b4a] to-[#8a5b23] border-none"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>

                {/* Authentication states handled via Shadcn Skeleton & Avatar */}
                {isAuthLoading && <Skeleton className="w-10 h-10 rounded-full" />}

                {!isAuthLoading && isAdmin && (
                  <Link href="/admin/dashboard" target="_blank">
                    {isSettingsLoading ? (
                      <Skeleton className="w-10 h-10 rounded-full" />
                    ) : (
                      <Avatar className="w-10 h-10 cursor-pointer border-2 border-orange-500">
                        <AvatarImage
                          src={
                            profilePicturePath
                              ? `${process.env.NEXT_PUBLIC_API_URL}${profilePicturePath}`
                              : undefined
                          }
                          alt="Admin"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold text-xs">
                          {getUserInitials(user?.displayName || 'Admin')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Link>
                )}

                {!isAuthLoading && isBuyer && (
                  <Link href="/buyer/dashboard" target="_blank">
                    <Avatar className="w-10 h-10 cursor-pointer">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white font-bold text-xs">
                        {getUserInitials(user?.displayName || 'Buyer')}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}

                {!isAuthLoading && !user && (
                  <Button
                    onClick={() => router.push('/login')}
                    className="rounded-full bg-gradient-to-br from-[#fdf0e1] to-[#fcd4ad] text-[#8a541f] font-semibold hover:shadow-md transition-all border border-amber-200 hover:bg-amber-100"
                  >
                    Login
                  </Button>
                )}
              </li>
            </ul>

            {/* Mobile Language Switches */}
            {isMobileMenuOpen && (
              <div className="block mt-5 pt-[18px] border-t border-white/15">
                <span className="block text-sm tracking-[0.6px] uppercase text-white/70 mb-3">
                  Language
                </span>
                <div className="flex gap-2.5">
                  <Button
                    variant={isEnglish ? 'default' : 'outline'}
                    className="flex-1 rounded-xl text-white border-white/25 bg-white/10"
                    onClick={() => setLanguage('en')}
                  >
                    🇬🇧 English
                  </Button>
                  <Button
                    variant={!isEnglish ? 'default' : 'outline'}
                    className="flex-1 rounded-xl text-white border-white/25 bg-white/10"
                    onClick={() => setLanguage('pt')}
                  >
                    🇵🇹 Português
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </header>

        {/* Mega Dropdown */}
        {typeof window !== 'undefined' && window.innerWidth > 1023 && (
          <CategoryMegaDropdown
            categories={activeCategories}
            isOpen={isCategoryDropdownOpen}
            onClose={() => setIsCategoryDropdownOpen(false)}
            topOffset={headerHeight}
            onMouseEnter={handleCategoryMouseEnter}
            onMouseLeave={handleCategoryMouseLeave}
          />
        )}

        {/* Component 4: Discount Banner */}
        <HeaderDiscountBanner publicDiscount={publicDiscount} />
      </div>
    </>
  );
};

export default Header;