"use client";

import DashboardShell from "@/components/DashboardShell";
import LeaveRequestPanel from "@/components/LeaveRequestPanel";
import NotificationSystem from "@/components/NotificationSystem";

export default function StudentLeaveRequestsPage() {
  return (
    <DashboardShell
      title="Leave Requests"
      subtitle="Submit and track verified leave requests"
      nav={[
        { href: "/dashboard/student", label: "Overview" },
        { href: "/dashboard/student/tests", label: "Online Tests" },
        { href: "/dashboard/student/recommendations", label: "AI Recommendations" },
        { href: "/dashboard/student/leave-requests", label: "Leave Requests" },
      ]}
      actions={<NotificationSystem />}
    >
      <LeaveRequestPanel userRole="student" />
    </DashboardShell>
  );
}