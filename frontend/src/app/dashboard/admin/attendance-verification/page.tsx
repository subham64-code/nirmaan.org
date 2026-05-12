'use client';

import DashboardShell from '@/components/DashboardShell';
import NotificationSystem from '@/components/NotificationSystem';
import AttendanceVerificationReport from '@/components/AttendanceVerificationReport';

export default function AdminAttendanceVerificationPage() {
  return (
    <DashboardShell
      title="Attendance Verification"
      subtitle="Review and approve GPS-verified attendance records"
      nav={[
        { href: '/dashboard/admin', label: 'Overview' },
        { href: '/dashboard/admin/attendance', label: 'Sync' },
        { href: '/dashboard/admin/attendance-verification', label: 'Verification' },
        { href: '/dashboard/admin/attendance-analytics', label: 'Analytics' },
      ]}
      actions={<NotificationSystem />}
    >
      <AttendanceVerificationReport />
    </DashboardShell>
  );
}
