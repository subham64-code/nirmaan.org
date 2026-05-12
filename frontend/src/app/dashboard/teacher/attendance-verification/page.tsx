'use client';

import DashboardShell from '@/components/DashboardShell';
import NotificationSystem from '@/components/NotificationSystem';
import AttendanceVerificationReport from '@/components/AttendanceVerificationReport';

export default function TeacherAttendanceVerificationPage() {
  return (
    <DashboardShell
      title="Attendance Verification"
      subtitle="Review and approve GPS-verified attendance records"
      nav={[
        { href: '/dashboard/teacher', label: 'Overview' },
        { href: '/dashboard/teacher/attendance-verification', label: 'Verification' },
        { href: '/dashboard/teacher/tests', label: 'Tests' },
      ]}
      actions={<NotificationSystem />}
    >
      <AttendanceVerificationReport />
    </DashboardShell>
  );
}
