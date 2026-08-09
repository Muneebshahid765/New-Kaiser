// components/admin/Sidebar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Plus,
  FolderTree,
  Upload,
  ShoppingBag,
  CreditCard,
  Star,
  MessageSquare,
  Headphones,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar?: () => void;
  closeSidebar?: () => void;
  isMobile?: boolean;
  unreadMessagesCount?: number;
  undeliveredOrdersCount?: number;
  userName?: string;
  userInitials?: string;
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  closeSidebar,
  isMobile = false,
  unreadMessagesCount = 0,
  undeliveredOrdersCount = 0,
  userName = 'Admin',
  userInitials = 'A',
}) => {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

 // components/admin/Sidebar.tsx

const menuGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      // 👈 Path fix karein: '/admin/dashboard' -> '/admin-dashboard'
      { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin-dashboard' },
      { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Analytics', path: '/admin-dashboard/analytics' },
    ]
  },
  {
    label: 'Catalog',
    items: [
      // 👈 Path fix karein: '/allproduct' -> '/admin-dashboard/all-products'
      { id: 'products', icon: <Package size={18} />, label: 'All Products', path: '/admin-dashboard/all-products' },
      
      // 🚨 BINGO FIX: Pehle '/add-product' tha, isko '/admin-dashboard/add-product' karein
      { id: 'add-product', icon: <Plus size={18} />, label: 'Add Product', path: '/admin-dashboard/add-product' },
      
      { id: 'categories', icon: <FolderTree size={18} />, label: 'Categories', path: '/admin-dashboard/categories' },
      { id: 'bulk', icon: <Upload size={18} />, label: 'Bulk Upload', path: '/admin-dashboard/bulk' },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { id: 'orders', icon: <ShoppingBag size={18} />, label: 'Orders', path: '/admin-dashboard/orders', badge: undeliveredOrdersCount },
      { id: 'subscriptions', icon: <CreditCard size={18} />, label: 'Subscriptions', path: '/admin-dashboard/subscriptions' },
      { id: 'reviews', icon: <Star size={18} />, label: 'Reviews', path: '/admin-dashboard/reviews' },
    ]
  },
  {
    label: 'Support',
    items: [
      { id: 'messages', icon: <MessageSquare size={18} />, label: 'Messages', path: '/admin-dashboard/messages', badge: unreadMessagesCount },
      { id: 'support', icon: <Headphones size={18} />, label: 'Support Tickets', path: '/admin-dashboard/support-tickets' },
      { id: 'users', icon: <Users size={18} />, label: 'Users', path: '/admin-dashboard/users' },
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'settings', icon: <Settings size={18} />, label: 'Settings', path: '/admin-dashboard/settings' },
    ]
  },
];

  const isActive = (path: string) => {
    if (path === '/admin-dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const handleItemClick = (path: string) => {
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-[#0f1117] border-r border-white/6
        flex flex-col z-[999] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        overflow-hidden backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]
        before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px]
        before:bg-gradient-to-r before:from-transparent before:via-[#6366f1] before:to-transparent before:opacity-40
        dark:bg-white dark:border-black/7
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64
        ${!isOpen && !isMobile ? 'lg:w-16' : ''}
      `}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 py-5 pb-4 border-b border-white/5 min-h-[68px] flex-shrink-0 dark:border-black/6">
        <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <rect width="32" height="32" rx="8" fill="url(#lg)" />
            <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {isOpen && (
          <div className="flex flex-col gap-[1px] overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
            <span className="text-[14px] font-semibold text-[#f1f5f9] tracking-[-0.02em] dark:text-[#0f172a]">
              AdminPanel
            </span>
            <span className="text-[10.5px] font-normal text-[#64748b] tracking-[0.04em] uppercase dark:text-[#64748b]">
              Management Suite
            </span>
          </div>
        )}
        {isMobile && isOpen && (
          <button
            onClick={closeSidebar}
            className="ml-auto w-7 h-7 rounded-[7px] border border-white/10 bg-white/5 text-[#64748b] flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors hover:bg-white/10 hover:text-[#f1f5f9]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 flex flex-col gap-0.5 scrollbar-none">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {isOpen ? (
              <span className="block text-[10px] font-semibold tracking-[0.08em] uppercase text-[#334155] px-2 pt-2.5 pb-1 whitespace-nowrap overflow-hidden animate-in fade-in duration-200 dark:text-[#94a3b8]">
                {group.label}
              </span>
            ) : (
              <hr className="border-none border-t border-white/5 my-2 mx-1 dark:border-black/6" />
            )}
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleItemClick(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px]
                  text-[#64748b] relative transition-colors duration-200
                  whitespace-nowrap select-none group
                  hover:bg-white/5 hover:text-[#f1f5f9]
                  dark:hover:bg-black/5 dark:hover:text-[#0f172a]
                  ${isActive(item.path) ? 'bg-[rgba(99,102,241,0.12)] text-[#6366f1]' : ''}
                  ${!isOpen ? 'justify-center px-2.5 py-2.5' : ''}
                `}
                title={!isOpen ? item.label : ''}
              >
                <span className={`
                  w-5 h-5 flex items-center justify-center flex-shrink-0
                  transition-transform duration-200
                  group-hover:scale-105
                  ${isActive(item.path) ? 'drop-shadow-[0_0_6px_rgba(99,102,241,0.25)]' : ''}
                `}>
                  {item.icon}
                </span>
                {isOpen && (
                  <>
                    <span className="text-[13.5px] font-[450] tracking-[-0.01em] flex-1 overflow-hidden text-ellipsis animate-in fade-in duration-200">
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none flex-shrink-0 animate-in zoom-in duration-200">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
                {!isOpen && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-[3px] bg-red-500 text-white text-[8.5px] font-bold rounded-full leading-none flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                {!isOpen && hoveredItem === item.id && (
                  <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-[#1e293b] text-[#f1f5f9] text-[12.5px] font-medium px-3 py-1.5 rounded-[7px] whitespace-nowrap pointer-events-none z-[9999] flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-white/8 animate-in fade-in slide-in-from-left-1 duration-150 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[5px] before:border-transparent before:border-r-[#1e293b]">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-3 flex-shrink-0 dark:border-black/6">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] cursor-pointer transition-colors hover:bg-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
            {userInitials}
          </div>
          {isOpen && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              <span className="text-[13px] font-[550] text-[#f1f5f9] whitespace-nowrap overflow-hidden text-ellipsis dark:text-[#0f172a]">
                {userName}
              </span>
              <span className="text-[10.5px] text-[#64748b] whitespace-nowrap dark:text-[#64748b]">
                Administrator
              </span>
            </div>
          )}
          {isOpen && (
            <button className="bg-none border-none text-[#334155] cursor-pointer w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-500/10 hover:text-red-500">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;