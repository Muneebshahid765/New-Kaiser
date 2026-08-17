'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { useGetAuth } from '@/context/auth-context';
import {
  usePublicDiscount,
} from '../app/features/admin/hooks/admin-settings.hooks';
import { useCategories } from '../app/features/categories/hooks/category.hooks';

import { CategoryMegaDropdown } from './CategoryDropDown';
import { HeaderUtilityBar } from './HeaderUtilityBar';
import { HeaderDiscountBanner } from './HeaderDiscountBanner';
import { HeaderNavLinks } from './HeaderNavLinks';
import { HeaderMobileBottomNav } from './HeaderMobileBottomNav';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { CategoryListItem } from '@/app/features/categories/types/category-reponse.types';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [headerHeight, setHeaderHeight] = useState<number>(80);

  const headerRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: rawUser, isLoading: isAuthLoading } = useGetAuth();
  const user = (rawUser as any)?.data?.data || (rawUser as any)?.data || rawUser;

  const { data: publicDiscount } = usePublicDiscount();
  const { data: rawCategories } = useCategories();

  const categoriesList: CategoryListItem[] = Array.isArray(rawCategories)
    ? rawCategories
    : Array.isArray((rawCategories as any)?.data)
    ? (rawCategories as any).data
    : Array.isArray((rawCategories as any)?.categories)
    ? (rawCategories as any).categories
    : [];

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
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [updateCartCount]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight + (isSticky ? 0 : 32));
    }
  }, [isSticky, publicDiscount]);

  const handleCategoryMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsCategoryDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
    }, 150);
  };

  const activeCategories = categoriesList.filter(
    (cat) => cat.status === 'active' && cat.slug !== 'uncategorized'
  );

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
      <div className="sticky top-0 z-[1000] w-full bg-white shadow-sm pb-12 lg:pb-0">
        {/* Utility Top Bar */}
        <HeaderUtilityBar />

        {/* Main Navbar */}
        <header
          ref={headerRef}
          className={`bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 py-3.5 transition-shadow ${
            isSticky ? 'shadow-md' : ''
          }`}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-800 flex items-center justify-center text-white font-bold text-base shadow-md">
              AK
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="m-0 text-base sm:text-lg text-slate-900 font-bold">Africa Kaiser</h1>
              <p className="m-0 text-[11px] sm:text-xs text-slate-500">Electrical & Building Materials</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-6 list-none m-0 p-0">
              <HeaderNavLinks
                isMobileMenuOpen={false}
                activePath={pathname}
                onCategoryMouseEnter={handleCategoryMouseEnter}
                onCategoryMouseLeave={handleCategoryMouseLeave}
              />
            </ul>
          </nav>

          {/* Actions (Cart & Profile) */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-slate-700 hover:text-amber-700 transition">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -right-1.5 h-4 min-w-[16px] px-1 text-[9px] bg-amber-600 border-none text-white">
                  {cartItemsCount}
                </Badge>
              )}
            </Link>

            {isAuthLoading ? (
              <Skeleton className="w-9 h-9 rounded-full" />
            ) : user ? (
              <Link href={user.role === 'admin' ? '/admin/dashboard' : '/buyer/dashboard'}>
                <Avatar className="w-9 h-9 border border-amber-300">
                  {/* <AvatarImage src={settings?.profile?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL}${settings.profile.profilePicture}` : undefined} /> */}
                  <AvatarFallback className="bg-amber-100 text-amber-800 text-xs font-bold">
                    {getUserInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                size="sm"
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 text-xs font-semibold"
              >
                Login
              </Button>
            )}
          </div>
        </header>

        {/* Sitewide Discount Banner */}
        <HeaderDiscountBanner publicDiscount={publicDiscount} />

        {/* Mega Category Dropdown */}
        <CategoryMegaDropdown
          categories={activeCategories}
          isOpen={isCategoryDropdownOpen}
          onClose={() => setIsCategoryDropdownOpen(false)}
          topOffset={headerHeight}
          onMouseEnter={handleCategoryMouseEnter}
          onMouseLeave={handleCategoryMouseLeave}
        />
      </div>

      {/* Mobile App-like Bottom Navigation */}
      <HeaderMobileBottomNav
        cartCount={cartItemsCount}
        user={user}
        onOpenCategories={() => setIsCategoryDropdownOpen(true)}
      />
    </>
  );
};

export default Header;