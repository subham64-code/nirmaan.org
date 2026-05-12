"use client";

import DashboardShell from "@/components/DashboardShell";
import NotificationSystem from "@/components/NotificationSystem";
import EnhancedExamSystem from "@/components/EnhancedExamSystem";

export default function TeacherTestsPage() {
  return (
    <DashboardShell
      title="Tests & Results"
      subtitle="Create, manage, and review teacher-assigned tests"
      nav={[
        { href: "/dashboard/teacher", label: "Overview" },
        { href: "/dashboard/teacher/tests", label: "Tests & Results" },
      ]}
      actions={<NotificationSystem />}
    >
      <EnhancedExamSystem userRole="teacher" />
    </DashboardShell>
  );
}
