"use client";

import DashboardShell from "@/components/DashboardShell";
import LeaveRequestPanel from "@/components/LeaveRequestPanel";
import NotificationSystem from "@/components/NotificationSystem";

export default function AdminLeaveRequestsPage() {
  return (
    <DashboardShell
      title="Leave Requests"
      subtitle="Verify student leave requests and send approval messages"
      nav={[
        { href: "/dashboard/admin", label: "Overview" },
        { href: "/dashboard/admin/applications", label: "Applications" },
        { href: "/dashboard/admin/teachers", label: "Teachers" },
        { href: "/dashboard/admin/leave-requests", label: "Leave Requests" },
      ]}
      actions={<NotificationSystem />}
    >
      <LeaveRequestPanel userRole="admin" />
    </DashboardShell>
  );
}