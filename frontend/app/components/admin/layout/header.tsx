// // components/admin/AdminHeader.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import {
//   Bell,
//   RefreshCw,
//   AlertTriangle,
//   ClipboardList,
//   MessageSquare,
//   Headphones,
//   Star,
//   PackageCheck,
//   Menu,
//   Settings,
//   LogOut,
//   ChevronDown,
//   Search,
// } from 'lucide-react';

// interface AdminHeaderProps {
//   toggleSidebar: () => void;
//   isSidebarOpen: boolean;
//   isMobile: boolean;
//   userName?: string;
//   userAvatar?: string;
//   unreadCount?: number;
//   notifications?: NotificationItem[];
//   onRefresh?: () => void;
//   isLoading?: boolean;
//   error?: string | null;
// }

// interface NotificationItem {
//   id: string;
//   type: 'order' | 'support' | 'message' | 'review';
//   title: string;
//   subtitle: string;
//   timestamp: string;
// }

// const AdminHeader: React.FC<AdminHeaderProps> = ({
//   toggleSidebar,
//   isSidebarOpen,
//   isMobile,
//   userName = 'Admin',
//   userAvatar,
//   unreadCount = 0,
//   notifications = [],
//   onRefresh,
//   isLoading = false,
//   error = null,
// }) => {
//   const router = useRouter();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const userMenuRef = useRef<HTMLDivElement>(null);
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   const safeBadgeCount = unreadCount > 99 ? '99+' : unreadCount;

//   const iconByType = {
//     order: <ClipboardList size={16} />,
//     support: <Headphones size={16} />,
//     message: <MessageSquare size={16} />,
//     review: <Star size={16} />,
//     default: <PackageCheck size={16} />,
//   };

//   const labelByType = {
//     order: 'Order',
//     support: 'Support',
//     message: 'Message',
//     review: 'Review',
//   };

//   const formatDate = (value: string) => {
//     if (!value) return 'just now';
//     const date = new Date(value);
//     const diffMs = Date.now() - date.getTime();
//     const diffMin = Math.floor(diffMs / 60000);
//     const diffHr = Math.floor(diffMs / 3600000);
//     const diffDay = Math.floor(diffMs / 86400000);

//     if (diffMin < 1) return 'just now';
//     if (diffMin < 60) return `${diffMin}m ago`;
//     if (diffHr < 24) return `${diffHr}h ago`;
//     if (diffDay < 7) return `${diffDay}d ago`;
//     return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//   };

//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
//         e.preventDefault();
//         searchInputRef.current?.focus();
//       }
//       if (e.key === 'Escape') {
//         setDropdownOpen(false);
//         setUserMenuOpen(false);
//       }
//     };
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setDropdownOpen(false);
//       }
//       if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
//         setUserMenuOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const feedItems = notifications.slice(0, 10);

//   return (
//     <header className="bg-white border-b border-[#e8ecf0] px-7 h-[68px] flex items-center justify-between sticky top-0 z-[90] w-full min-w-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
//       {/* Left Section */}
//       <div className="flex items-center gap-4 flex-1 min-w-0">
//         <button
//           className="bg-transparent border-none cursor-pointer p-2 rounded-[10px] text-[#64748b] flex items-center justify-center flex-shrink-0 transition-colors hover:bg-[#f1f5f9] hover:text-[#1e293b]"
//           onClick={toggleSidebar}
//           aria-label="Toggle sidebar"
//         >
//           <Menu size={22} />
//         </button>

//         <div className="flex items-center gap-2.5 bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-xl px-[14px] h-10 flex-1 max-w-[440px] transition-all focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] focus-within:bg-white">
//           <Search size={16} className="text-[#94a3b8] flex-shrink-0" />
//           <input
//             ref={searchInputRef}
//             type="text"
//             placeholder="Search orders, products, customers…"
//             className="border-none bg-transparent outline-none text-[14px] text-[#1e293b] w-full font-inherit placeholder:text-[#b0bac9]"
//           />
//           <kbd className="text-[11px] text-[#94a3b8] bg-[#e2e8f0] rounded-[5px] px-1.5 py-0.5 flex-shrink-0">
//             ⌘K
//           </kbd>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="flex items-center gap-1.5 flex-shrink-0">
//         {/* Notifications */}
//         <div ref={dropdownRef} className="relative">
//           <button
//             type="button"
//             className={`
//               relative bg-transparent border-none cursor-pointer p-[9px] rounded-[10px] text-[#64748b]
//               flex items-center justify-center transition-colors hover:bg-[#f1f5f9] hover:text-[#1e293b]
//               ${dropdownOpen ? 'bg-[#eef2ff] text-[#6366f1]' : ''}
//             `}
//             onClick={() => setDropdownOpen((p) => !p)}
//             aria-label="Notifications"
//           >
//             <Bell size={19} />
//             {safeBadgeCount > 0 && (
//               <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1 border-2 border-white animate-pulse">
//                 {safeBadgeCount}
//               </span>
//             )}
//             {isLoading && (
//               <span className="absolute bottom-1.5 right-1.5 w-[7px] h-[7px] bg-green-500 rounded-full border-2 border-white animate-pulse" />
//             )}
//           </button>

//           {dropdownOpen && (
//             <div className="absolute top-[calc(100%+10px)] right-0 w-[400px] bg-white rounded-[18px] shadow-[0_24px_48px_-8px_rgba(15,23,42,0.18)] border border-black/6 z-[200] overflow-hidden animate-in slide-in-from-top-1 duration-200">
//               {/* Header */}
//               <div className="px-5 pt-[18px] pb-[14px] border-b border-[#f1f5f9] flex justify-between items-start">
//                 <div>
//                   <p className="text-[11px] text-[#94a3b8] uppercase tracking-[0.8px] font-semibold m-0">Live alerts</p>
//                   <h4 className="text-[16px] font-bold text-[#0f172a] m-0 font-['Plus_Jakarta_Sans',sans-serif]">Notifications</h4>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={onRefresh}
//                   disabled={isLoading}
//                   className="bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#64748b] cursor-pointer flex items-center gap-1.5 transition-all hover:bg-white hover:border-[#cbd5e1] hover:text-[#334155] disabled:opacity-45 disabled:cursor-not-allowed font-inherit"
//                 >
//                   <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
//                   Refresh
//                 </button>
//               </div>

//               {/* Body */}
//               {error ? (
//                 <div className="p-5 flex gap-2.5 items-start bg-[#fef2f2] text-[#dc2626]">
//                   <AlertTriangle size={16} className="flex-shrink-0 text-[#ef4444] mt-0.5" />
//                   <div>
//                     <strong className="text-[13px] block mb-0.5">Failed to load</strong>
//                     <p className="text-[12px] m-0 text-[#991b1b]">{error}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="max-h-[420px] overflow-y-auto">
//                   {feedItems.length > 0 ? (
//                     <ul className="list-none m-0 p-0">
//                       {feedItems.map((item) => (
//                         <li
//                           key={`${item.type}-${item.id}`}
//                           className={`
//                             px-5 py-[13px] border-b border-[#f8fafc] flex gap-3 transition-colors cursor-pointer
//                             border-l-[3px] border-l-transparent hover:bg-[#fafbff]
//                             ${item.type === 'order' ? 'border-l-[#6366f1]' : ''}
//                             ${item.type === 'support' ? 'border-l-[#8b5cf6]' : ''}
//                             ${item.type === 'message' ? 'border-l-[#06b6d4]' : ''}
//                             ${item.type === 'review' ? 'border-l-[#f59e0b]' : ''}
//                           `}
//                         >
//                           <div className="flex-shrink-0 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center bg-[#f1f5f9] text-[#64748b]">
//                             {iconByType[item.type] || iconByType.default}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-[13px] font-semibold text-[#0f172a] mb-0.5">{item.title}</div>
//                             <div className="text-[12px] text-[#64748b] mb-1.5 leading-relaxed">{item.subtitle}</div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <span className={`
//                                 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.4px]
//                                 ${item.type === 'order' ? 'bg-[#eef2ff] text-[#4338ca]' : ''}
//                                 ${item.type === 'support' ? 'bg-[#f5f3ff] text-[#6d28d9]' : ''}
//                                 ${item.type === 'message' ? 'bg-[#ecfeff] text-[#0e7490]' : ''}
//                                 ${item.type === 'review' ? 'bg-[#fffbeb] text-[#92400e]' : ''}
//                               `}>
//                                 {labelByType[item.type] || 'Update'}
//                               </span>
//                               <span className="text-[10px] text-[#94a3b8]">{formatDate(item.timestamp)}</span>
//                             </div>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <div className="py-11 px-6 text-center text-[#94a3b8]">
//                       <Bell size={30} strokeWidth={1} className="mx-auto mb-2.5 opacity-40" />
//                       <p className="text-[14px] font-medium text-[#64748b] m-0 mb-1">No new notifications</p>
//                       <span className="text-[12px] text-[#94a3b8]">All caught up!</span>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {feedItems.length > 10 && (
//                 <div className="px-5 py-3 border-t border-[#f1f5f9] text-center">
//                   <button
//                     onClick={() => router.push('/notifications')}
//                     className="bg-none border-none text-[#6366f1] text-[13px] font-semibold cursor-pointer hover:underline"
//                   >
//                     View all notifications
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* User Menu */}
//         <div ref={userMenuRef} className="relative">
//           <button
//             className="flex items-center gap-2.5 bg-transparent border-[1.5px] border-[#e2e8f0] rounded-xl py-1.5 pr-2.5 pl-1.5 cursor-pointer transition-colors hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
//             onClick={() => setUserMenuOpen((p) => !p)}
//           >
//             <div className="w-8 h-8 rounded-[9px] overflow-hidden flex-shrink-0">
//               {userAvatar ? (
//                 <img src={userAvatar} alt="Admin" className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-[13px] font-bold">
//                   {userName.charAt(0).toUpperCase()}
//                 </div>
//               )}
//             </div>
//             <div className="flex flex-col text-left">
//               <span className="text-[13px] font-semibold text-[#1e293b] leading-tight">{userName}</span>
//               <span className="text-[11px] text-[#94a3b8]">Administrator</span>
//             </div>
//             <ChevronDown size={16} className={`text-[#94a3b8] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
//           </button>

//           {userMenuOpen && (
//             <div className="absolute top-[calc(100%+10px)] right-0 w-[230px] bg-white rounded-[16px] shadow-[0_20px_40px_-8px_rgba(15,23,42,0.16)] border border-black/6 z-[200] overflow-hidden animate-in slide-in-from-top-1 duration-200">
//               <div className="p-4 flex items-center gap-3 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
//                 <div className="w-10 h-10 rounded-[11px] overflow-hidden border-2 border-white/30 flex-shrink-0">
//                   {userAvatar ? (
//                     <img src={userAvatar} alt="Admin" className="w-full h-full object-cover" />
//                   ) : (
//                     <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-[16px] font-bold">
//                       {userName.charAt(0).toUpperCase()}
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <h4 className="text-[13px] font-bold text-white m-0 mb-0.5 font-['Plus_Jakarta_Sans',sans-serif]">{userName}</h4>
//                   <p className="text-[11px] text-white/75 m-0">Administrator</p>
//                 </div>
//               </div>
//               <div className="p-2">
//                 <Link
//                   href="/admin/dashboard/profile"
//                   className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-transparent border-none rounded-[10px] text-[13px] font-medium text-[#334155] cursor-pointer transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] font-inherit"
//                 >
//                   <Settings size={16} />
//                   Profile Settings
//                 </Link>
//                 <hr className="border-none border-t border-[#f1f5f9] my-1.5" />
//                 <button
//                   className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-transparent border-none rounded-[10px] text-[13px] font-medium text-[#ef4444] cursor-pointer transition-colors hover:bg-[#fef2f2] hover:text-[#dc2626] font-inherit"
//                 >
//                   <LogOut size={16} />
//                   Sign Out
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AdminHeader;