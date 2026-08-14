// components/dashboard/Header.tsx
import React from 'react';
import Link from 'next/link';
import { Bell, Settings, Menu, ChevronRight, Search } from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
  unreadCount: number;
  onMenuClick: () => void;
  userInitials: string;
  onAvatarClick: () => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  unreadCount,
  onMenuClick,
  userInitials,
  onAvatarClick,
  showSearch = true,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#e8edf2] flex items-center justify-between gap-4 px-6 lg:px-12 flex-shrink-0 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        <button
          className="lg:hidden bg-transparent border-none text-[#4b5c6b] cursor-pointer p-1.5 rounded-[8px] transition-colors duration-200 hover:bg-[#f0f4f8] hover:text-[#0f1923]"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#8fa3b1] hidden sm:inline">Home</span>
          <ChevronRight size={13} className="text-[#8fa3b1] hidden sm:inline" />
          <span className="text-[13px] text-[#0f1923] font-semibold">{pageTitle}</span>
        </div>
      </div>

      {/* Center Section - Search */}
      {showSearch && (
        <div className="flex-1 flex justify-center hidden lg:flex">
          <div className="flex items-center gap-2 bg-[#f4f7f9] border border-[#e8edf2] rounded-full px-4 h-[38px] max-w-[380px] w-full transition-colors duration-200 focus-within:border-[#0d9488] focus-within:shadow-[0_0_0_3px_rgba(13,148,136,0.1)]">
            <Search size={15} className="text-[#8fa3b1] flex-shrink-0" />
            <input
              className="flex-1 border-none bg-transparent text-[13px] font-['Plus_Jakarta_Sans',sans-serif] text-[#0f1923] outline-none placeholder:text-[#8fa3b1]"
              placeholder="Search orders, products..."
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[12.5px] text-[#8fa3b1] hidden md:inline">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
        
        <Link
          href="/buyer/dashboard/notifications"
          className="relative w-[38px] h-[38px] flex items-center justify-center rounded-[8px] text-[#4b5c6b] transition-colors duration-200 hover:bg-[#f4f7f9] hover:text-[#0d9488]"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-red-500 rounded-full border-2 border-white" />
          )}
        </Link>
        
        <Link
          href="/buyer/dashboard/profile"
          className="relative w-[38px] h-[38px] flex items-center justify-center rounded-[8px] text-[#4b5c6b] transition-colors duration-200 hover:bg-[#f4f7f9] hover:text-[#0d9488]"
        >
          <Settings size={18} />
        </Link>
        
        <button
          onClick={onAvatarClick}
          className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#0d9488] to-[#0891b2] text-white text-[12px] font-bold flex items-center justify-center cursor-pointer ml-1 shadow-[0_2px_8px_rgba(13,148,136,0.3)] transition-transform duration-150 hover:scale-105"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
};

export default Header;