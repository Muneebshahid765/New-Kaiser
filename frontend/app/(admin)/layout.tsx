// // app/admin/layout.tsx
// import AdminLayout from '@/app/components/admin/layout/admin-layout';

// export default function AdminDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // These would come from your state management in a real app
//   const mockNotifications = [
//     {
//       id: '1',
//       type: 'order' as const,
//       title: 'New order #1234',
//       subtitle: 'John Doe placed a new order',
//       timestamp: new Date().toISOString(),
//     },
//     {
//       id: '2',
//       type: 'message' as const,
//       title: 'New message from Sarah',
//       subtitle: 'Question about product delivery',
//       timestamp: new Date(Date.now() - 3600000).toISOString(),
//     },
//   ];

//   return (
//     <AdminLayout
//       userName="John Admin"
//       userInitials="JA"
//       unreadMessagesCount={3}
//       undeliveredOrdersCount={5}
//       unreadNotificationsCount={2}
//       notifications={mockNotifications}
//     >
//       {children}
//     </AdminLayout>
//   );
// }




export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
   
      <main>{children}</main>
      
    </>
  );
}