'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingCart, User, Layers } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface HeaderMobileBottomNavProps {
  cartCount: number;
  user: any;
  onOpenCategories: () => void;
}

export const HeaderMobileBottomNav: React.FC<HeaderMobileBottomNavProps> = ({
  cartCount,
  user,
  onOpenCategories,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', action: onOpenCategories, icon: Grid },
    { label: 'Products', href: '/products', icon: Layers },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
    {
      label: user ? 'Account' : 'Login',
      href: user ? (user.role === 'admin' ? '/admin/dashboard' : '/buyer/dashboard') : '/login',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 z-[999] lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;

          const content = (
            <div className="flex flex-col items-center gap-1 relative text-center">
              <div className="relative">
                <Icon
                  size={20}
                  className={isActive ? 'text-amber-700' : 'text-slate-500'}
                />
                {!!item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 text-[9px] bg-amber-600 border-none text-white flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-amber-700 font-bold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.action) {
            return (
              <button key={idx} onClick={item.action} className="p-1 focus:outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={idx} href={item.href || '#'} className="p-1">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};