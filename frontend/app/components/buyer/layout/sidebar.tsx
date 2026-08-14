// 'use client'
// // components/dashboard/DashboardLayout.tsx
// import React, { useState } from 'react';
// import { useRouter, usePathname } from "next/navigation";
// import Link from 'next/link';
// import {
//   LayoutDashboard,
//   ShoppingBag,
//   User,
//   LogOut,
//   Activity,
//   LifeBuoy,
//   MapPin,
//   CreditCard,
//   Bell,
//   Crown,
//   ChevronRight,
//   ChevronLeft,
//   X,
// } from 'lucide-react';
// import Header from './header';

// // Navigation Configuration
// const NAV_ITEMS = [
//   {
//     group: 'Main',
//     links: [
//       { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
//       { to: '/buyer/dashboard/orders', label: 'My Orders', icon: ShoppingBag },
//       { to: '/buyer/dashboard/analytics', label: 'Analytics', icon: Activity },
//     ],
//   },
//   {
//     group: 'Account',
//     links: [
//       { to: '/buyer/dashboard/profile', label: 'Profile Settings', icon: User },
//       { to: '/buyer/dashboard/addresses', label: 'Saved Addresses', icon: MapPin },
//       { to: '/buyer/dashboard/billing', label: 'Billing & Invoices', icon: CreditCard },
//       { to: '/buyer/dashboard/subscription', label: 'My Subscription', icon: Crown },
//     ],
//   },
//   {
//     group: 'Support',
//     links: [
//       { to: '/buyer/dashboard/notifications', label: 'Notifications', icon: Bell, badge: true },
//       { to: '/buyer/dashboard/support', label: 'Support', icon: LifeBuoy },
//     ],
//   },
// ];

// interface NavLinkProps {
//   to: string;
//   label: string;
//   icon: React.ComponentType<{ size?: number; className?: string }>;
//   end?: boolean;
//   badge?: boolean;
//   collapsed?: boolean;
//   unreadCount?: number;
//   notificationLoading?: boolean;
//   onClick?: () => void;
// }

// const NavLinkItem: React.FC<NavLinkProps> = ({
//   to,
//   label,
//   icon: Icon,
//   end,
//   badge,
//   collapsed,
//   unreadCount = 0,
//   notificationLoading = false,
//   onClick,
// }) => {
//   const pathname = usePathname();
//   const isActive = end 
//     ? pathname === to 
//     : pathname?.startsWith(to);

//   return (
//     <Link
//       href={to}
//       onClick={onClick}
//       className={`
//         flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] text-[13.5px] font-medium
//         text-[#4b5c6b] no-underline transition-colors duration-200 relative mb-[1px]
//         whitespace-nowrap overflow-hidden
//         hover:bg-[#f0f4f8] hover:text-[#0f1923]
//         ${isActive ? 'bg-[rgba(13,148,136,0.1)] text-[#0d9488]' : ''}
//         ${isActive ? 'before:content-[""] before:absolute before:left-0 before:top-[18%] before:h-[64%] before:w-[3px] before:bg-[#0d9488] before:rounded-r-[3px]' : ''}
//         ${collapsed ? 'justify-center px-2.5 py-2.5 before:hidden' : ''}
//       `}
//       title={collapsed ? label : undefined}
//     >
//       <span className="relative w-5 h-5 flex items-center justify-center flex-shrink-0 text-[#8fa3b1] transition-colors duration-200 group-hover:text-[#0f1923]">
//         <Icon size={18} />
//         {badge && unreadCount > 0 && !notificationLoading && collapsed && (
//           <span className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white" />
//         )}
//       </span>
      
//       {!collapsed && (
//         <>
//           <span className="flex-1">{label}</span>
//           {badge && unreadCount > 0 && !notificationLoading && (
//             <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 rounded-full inline-flex items-center justify-center flex-shrink-0">
//               {unreadCount > 99 ? '99+' : unreadCount}
//             </span>
//           )}
//           <ChevronRight size={13} className="text-[#8fa3b1] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
//         </>
//       )}
//     </Link>
//   );
// };

// interface DashboardLayoutProps {
//   children: React.ReactNode;
//   userName?: string;
//   userEmail?: string;
//   userInitials?: string;
//   unreadCount?: number;
//   notificationLoading?: boolean;
// }

// const DashboardLayout: React.FC<DashboardLayoutProps> = ({
//   children,
//   userName = 'John Doe',
//   userEmail = 'john@example.com',
//   userInitials = 'JD',
//   unreadCount = 0,
//   notificationLoading = false,
// }) => {
//   const router = useRouter();
//   const pathname = usePathname();

//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const getPageTitle = () => {
//     if (pathname?.endsWith('/orders')) return 'My Orders';
//     if (pathname?.endsWith('/analytics')) return 'Analytics';
//     if (pathname?.endsWith('/profile')) return 'Profile Settings';
//     if (pathname?.endsWith('/addresses')) return 'Saved Addresses';
//     if (pathname?.endsWith('/billing')) return 'Billing & Invoices';
//     if (pathname?.endsWith('/subscription')) return 'My Subscription';
//     if (pathname?.endsWith('/notifications')) return 'Notifications';
//     if (pathname?.endsWith('/support')) return 'Support';
//     return 'Dashboard';
//   };

//   const handleLogoutConfirm = () => {
//     setIsLoggingOut(true);
//     // Simulate logout
//     setTimeout(() => {
//       router.push('/');
//       setIsLoggingOut(false);
//       setIsLogoutModalOpen(false);
//     }, 1000);
//   };

//   // Desktop Sidebar
//   const DesktopSidebar = () => (
//     <aside
//       className={`
//         h-screen bg-white border-r border-[#e8edf2] flex flex-col flex-shrink-0 
//         overflow-visible transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
//         z-50 hidden lg:flex
//         ${collapsed ? 'w-[68px]' : 'w-64'}
//       `}
//     >
//       {/* Brand Row */}
//       <div className="flex items-center gap-2.5 px-[18px] h-[68px] min-h-[68px] max-h-[68px] border-b border-[#f0f4f8] flex-shrink-0 overflow-visible relative z-10">
//         <div className="w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0 shadow-[0_4px_12px_rgba(13,148,136,0.3)]">
//           <svg viewBox="0 0 36 36" fill="none" className="w-full h-full block">
//             <rect width="36" height="36" rx="10" fill="url(#tg)" />
//             <path d="M10 18C10 13.6 13.6 10 18 10C22.4 10 26 13.6 26 18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
//             <circle cx="18" cy="18" r="3.5" fill="white"/>
//             <path d="M14 22L18 26L22 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             <defs>
//               <linearGradient id="tg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
//                 <stop stopColor="#0d9488"/>
//                 <stop offset="1" stopColor="#0891b2"/>
//               </linearGradient>
//             </defs>
//           </svg>
//         </div>

//         <div
//           className={`
//             flex-1 flex flex-col gap-[1px] min-w-0 overflow-hidden
//             transition-[opacity,max-width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
//             ${collapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[160px]'}
//           `}
//         >
//           <span className="text-[14px] font-bold text-[#0f1923] tracking-[-0.02em] whitespace-nowrap">
//             BuyerPortal
//           </span>
//           <span className="text-[10px] font-semibold text-[#8fa3b1] tracking-[0.08em] uppercase whitespace-nowrap">
//             My Workspace
//           </span>
//         </div>

//         <button
//           className="w-[26px] h-[26px] rounded-[7px] border border-[#e8edf2] bg-white text-[#8fa3b1] flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors duration-200 hover:bg-[rgba(13,148,136,0.1)] hover:text-[#0d9488] hover:border-[rgba(13,148,136,0.18)] relative z-30"
//           onClick={() => setCollapsed((c) => !c)}
//           title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           <ChevronLeft
//             size={15}
//             className={`transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
//               collapsed ? 'rotate-180' : ''
//             }`}
//           />
//         </button>
//       </div>

//       {/* Profile Card */}
//       {!collapsed ? (
//         <div className="flex items-center gap-[11px] mx-2.5 my-3 px-[14px] py-3 bg-gradient-to-br from-[rgba(13,148,136,0.1)] to-[rgba(8,145,178,0.07)] rounded-[12px] border border-[rgba(13,148,136,0.18)] flex-shrink-0 overflow-hidden relative z-5">
//           <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#0d9488] to-[#0891b2] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_3px_8px_rgba(13,148,136,0.3)]">
//             {userInitials}
//           </div>
//           <div className="flex flex-col gap-0.5 min-w-0">
//             <span className="text-[12.5px] font-semibold text-[#0f1923] whitespace-nowrap overflow-hidden text-ellipsis">
//               {userName}
//             </span>
//             <span className="text-[10.5px] text-[#4b5c6b] whitespace-nowrap overflow-hidden text-ellipsis">
//               {userEmail}
//             </span>
//           </div>
//         </div>
//       ) : (
//         <div
//           className="flex justify-center py-2.5 cursor-pointer flex-shrink-0"
//           onClick={() => router.push('/buyer/dashboard/profile')}
//           title="Profile"
//         >
//           <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#0d9488] to-[#0891b2] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_3px_8px_rgba(13,148,136,0.3)]">
//             {userInitials}
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1.5 flex flex-col scrollbar-none">
//         {NAV_ITEMS.map((group) => (
//           <div key={group.group} className="mb-1">
//             {!collapsed ? (
//               <span className="block text-[9.5px] font-bold tracking-[0.1em] uppercase text-[#8fa3b1] px-2.5 pt-2.5 pb-1 whitespace-nowrap">
//                 {group.group}
//               </span>
//             ) : (
//               <hr className="border-none border-t border-[#f0f4f8] my-2 mx-1" />
//             )}
//             {group.links.map((link) => (
//               <NavLinkItem
//                 key={link.to}
//                 to={link.to}
//                 label={link.label}
//                 icon={link.icon}
//                 end={link.end}
//                 badge={link.badge}
//                 collapsed={collapsed}
//                 unreadCount={unreadCount}
//                 notificationLoading={notificationLoading}
//               />
//             ))}
//           </div>
//         ))}
//       </nav>

//       {/* Footer */}
//       <div className="border-t border-[#e8edf2] p-2.5 flex-shrink-0">
//         <button
//           className={`
//             flex items-center gap-[9px] w-full px-2.5 py-[9px] rounded-[8px] border-none
//             bg-transparent text-[#4b5c6b] text-[13.5px] font-medium font-inherit
//             cursor-pointer whitespace-nowrap transition-colors duration-200
//             hover:bg-[rgba(239,68,68,0.07)] hover:text-red-500
//             ${collapsed ? 'justify-center px-2.5 py-2.5' : ''}
//           `}
//           onClick={() => setIsLogoutModalOpen(true)}
//           title="Sign Out"
//         >
//           <LogOut size={16} />
//           {!collapsed && <span>Sign Out</span>}
//         </button>
//       </div>
//     </aside>
//   );

//   // Mobile Sidebar
//   const MobileSidebar = () => (
//     <aside
//       className={`
//         lg:hidden flex flex-col fixed top-0 left-0 w-[272px] h-screen
//         bg-white border-r border-[#e8edf2] z-[100] overflow-hidden
//         shadow-[0_12px_40px_rgba(0,0,0,0.12)]
//         transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]
//         ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}
//     >
//       {/* Brand Row - Mobile */}
//       <div className="flex items-center gap-2.5 px-[18px] h-[68px] min-h-[68px] max-h-[68px] border-b border-[#f0f4f8] flex-shrink-0">
//         <div className="w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0 shadow-[0_4px_12px_rgba(13,148,136,0.3)]">
//           <svg viewBox="0 0 36 36" fill="none" className="w-full h-full block">
//             <rect width="36" height="36" rx="10" fill="url(#tgm)" />
//             <path d="M10 18C10 13.6 13.6 10 18 10C22.4 10 26 13.6 26 18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
//             <circle cx="18" cy="18" r="3.5" fill="white"/>
//             <path d="M14 22L18 26L22 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             <defs>
//               <linearGradient id="tgm" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
//                 <stop stopColor="#0d9488"/>
//                 <stop offset="1" stopColor="#0891b2"/>
//               </linearGradient>
//             </defs>
//           </svg>
//         </div>
//         <div className="flex-1 flex flex-col gap-[1px]">
//           <span className="text-[14px] font-bold text-[#0f1923] tracking-[-0.02em] whitespace-nowrap">
//             BuyerPortal
//           </span>
//           <span className="text-[10px] font-semibold text-[#8fa3b1] tracking-[0.08em] uppercase whitespace-nowrap">
//             My Workspace
//           </span>
//         </div>
//         <button
//           className="w-[28px] h-[28px] rounded-[7px] border border-[#e8edf2] bg-[#f0f4f8] text-[#8fa3b1] flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors duration-200 hover:bg-[rgba(13,148,136,0.1)] hover:text-[#0d9488]"
//           onClick={() => setMobileOpen(false)}
//         >
//           <X size={18} />
//         </button>
//       </div>

//       {/* Profile Card - Mobile */}
//       <div className="flex items-center gap-[11px] mx-2.5 my-3 px-[14px] py-3 bg-gradient-to-br from-[rgba(13,148,136,0.1)] to-[rgba(8,145,178,0.07)] rounded-[12px] border border-[rgba(13,148,136,0.18)] flex-shrink-0">
//         <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#0d9488] to-[#0891b2] text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_3px_8px_rgba(13,148,136,0.3)]">
//           {userInitials}
//         </div>
//         <div className="flex flex-col gap-0.5 min-w-0">
//           <span className="text-[12.5px] font-semibold text-[#0f1923] whitespace-nowrap overflow-hidden text-ellipsis">
//             {userName}
//           </span>
//           <span className="text-[10.5px] text-[#4b5c6b] whitespace-nowrap overflow-hidden text-ellipsis">
//             {userEmail}
//           </span>
//         </div>
//       </div>

//       {/* Navigation - Mobile */}
//       <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1.5 flex flex-col scrollbar-none">
//         {NAV_ITEMS.map((group) => (
//           <div key={group.group} className="mb-1">
//             <span className="block text-[9.5px] font-bold tracking-[0.1em] uppercase text-[#8fa3b1] px-2.5 pt-2.5 pb-1 whitespace-nowrap">
//               {group.group}
//             </span>
//             {group.links.map((link) => (
//               <NavLinkItem
//                 key={link.to}
//                 to={link.to}
//                 label={link.label}
//                 icon={link.icon}
//                 end={link.end}
//                 badge={link.badge}
//                 unreadCount={unreadCount}
//                 notificationLoading={notificationLoading}
//                 onClick={() => setMobileOpen(false)}
//               />
//             ))}
//           </div>
//         ))}
//       </nav>

//       {/* Footer - Mobile */}
//       <div className="border-t border-[#e8edf2] p-2.5 flex-shrink-0">
//         <button
//           className="flex items-center gap-[9px] w-full px-2.5 py-[9px] rounded-[8px] border-none bg-transparent text-[#4b5c6b] text-[13.5px] font-medium font-inherit cursor-pointer whitespace-nowrap transition-colors duration-200 hover:bg-[rgba(239,68,68,0.07)] hover:text-red-500"
//           onClick={() => setIsLogoutModalOpen(true)}
//         >
//           <LogOut size={16} />
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </aside>
//   );

//   return (
//     <div className="flex h-screen w-full bg-[#f4f7f9] text-[#0f1923] font-['Plus_Jakarta_Sans',-apple-system,sans-serif] overflow-hidden">
//       {/* Desktop Sidebar */}
//       <DesktopSidebar />

//       {/* Mobile Overlay */}
//       {mobileOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/40 z-[90] backdrop-blur-[2px] animate-in fade-in duration-200"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* Mobile Sidebar */}
//       <MobileSidebar />

//       {/* Main Panel */}
//       <div className="flex-1 flex flex-col overflow-hidden min-w-0">
//         <Header
//           pageTitle={getPageTitle()}
//           unreadCount={unreadCount}
//           onMenuClick={() => setMobileOpen(true)}
//           userInitials={userInitials}
//           onAvatarClick={() => router.push('/buyer/dashboard/profile')}
//           showSearch={true}
//         />

//         <main className="flex-1 overflow-y-auto p-4 md:p-7 bg-[#f4f7f9]">
//           {children}
//         </main>
//       </div>

//       {/* Logout Modal */}
//       {isLogoutModalOpen && (
//         <div className="fixed inset-0 bg-[rgba(15,25,35,0.5)] backdrop-blur-[4px] flex items-center justify-center z-[200] animate-in fade-in duration-200">
//           <div className="bg-white rounded-[16px] p-8 pb-7 w-full max-w-[360px] text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#e8edf2] animate-in slide-in-from-bottom-4 duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)]">
//             <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(239,68,68,0.08)] text-red-500 flex items-center justify-center mx-auto mb-4">
//               <LogOut size={24} />
//             </div>
//             <h3 className="text-[18px] font-bold text-[#0f1923] m-0 mb-2">Sign Out?</h3>
//             <p className="text-[13.5px] text-[#4b5c6b] m-0 mb-6 leading-relaxed">
//               You'll need to sign in again to access your buyer dashboard.
//             </p>
//             <div className="flex gap-2.5">
//               <button
//                 className="flex-1 px-2.5 py-2.5 rounded-[8px] border border-[#e8edf2] bg-transparent text-[#4b5c6b] text-[13.5px] font-semibold font-inherit cursor-pointer transition-colors duration-200 hover:bg-[#f4f7f9] disabled:opacity-50 disabled:cursor-not-allowed"
//                 onClick={() => setIsLogoutModalOpen(false)}
//                 disabled={isLoggingOut}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="flex-1 px-2.5 py-2.5 rounded-[8px] border-none bg-red-500 text-white text-[13.5px] font-semibold font-inherit cursor-pointer transition-colors duration-200 hover:bg-red-600 active:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
//                 onClick={handleLogoutConfirm}
//                 disabled={isLoggingOut}
//               >
//                 {isLoggingOut ? 'Signing out...' : 'Sign Out'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashboardLayout;