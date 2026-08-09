'use client'
// components/admin/AdminLayout.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './sidebar';
import AdminHeader from './header';

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userAvatar?: string;
  userInitials?: string;
  unreadMessagesCount?: number;
  undeliveredOrdersCount?: number;
  unreadNotificationsCount?: number;
  notifications?: any[];
  onRefreshNotifications?: () => void;
  isLoadingNotifications?: boolean;
  notificationsError?: string | null;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  userName = 'Admin',
  userAvatar,
  userInitials = 'A',
  unreadMessagesCount = 0,
  undeliveredOrdersCount = 0,
  unreadNotificationsCount = 0,
  notifications = [],
  onRefreshNotifications,
  isLoadingNotifications = false,
  notificationsError = null,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarState');
      if (saved !== null) return JSON.parse(saved);
      return window.innerWidth > 1024;
    }
    return true;
  });

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (!mobile && window.innerWidth > 1024) {
      setIsSidebarOpen(true);
    } else if (mobile) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    localStorage.setItem('adminSidebarState', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((p) => !p), []);
  const closeSidebar = useCallback(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-[#f0f2f5] font-['DM_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        isMobile={isMobile}
        unreadMessagesCount={unreadMessagesCount}
        undeliveredOrdersCount={undeliveredOrdersCount}
        userName={userName}
        userInitials={userInitials}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[3px] z-[998] animate-in fade-in duration-200"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen min-w-0
          transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${!isMobile ? (isSidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'}
        `}
      >
        <AdminHeader
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          userName={userName}
          userAvatar={userAvatar}
          unreadCount={unreadNotificationsCount}
          notifications={notifications}
          onRefresh={onRefreshNotifications}
          isLoading={isLoadingNotifications}
          error={notificationsError}
        />

        <main className="flex-1 p-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;