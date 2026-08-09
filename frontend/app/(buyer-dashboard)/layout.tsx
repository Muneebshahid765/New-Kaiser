// app/buyer/dashboard/layout.tsx
import DashboardLayout from '@/app/components/buyer-layout/sidebar';

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      userName="John Doe"
      userEmail="john@example.com"
      userInitials="JD"
      unreadCount={5}
      notificationLoading={false}
    >
      {children}
    </DashboardLayout>
  );
}