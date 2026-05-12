'use client';

import DashboardShell from '@/components/DashboardShell';
import NotificationSystem from '@/components/NotificationSystem';
import GPSBasedAttendance from '@/components/GPSBasedAttendance';

export default function StudentAttendancePage() {
  return (
    <DashboardShell
      title="Attendance & Check-In"
      subtitle="GPS-verified attendance tracking with geolocation"
      nav={[
        { href: '/dashboard/student', label: 'Overview' },
        { href: '/dashboard/student/attendance', label: 'Attendance' },
        { href: '/dashboard/student/tests', label: 'Tests' },
      ]}
      actions={<NotificationSystem />}
    >
      <GPSBasedAttendance />
    </DashboardShell>
  );
}
