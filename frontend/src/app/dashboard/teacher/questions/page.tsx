'use client';

import DashboardShell from '@/components/DashboardShell';
import NotificationSystem from '@/components/NotificationSystem';
import QuestionExtractor from '@/components/QuestionExtractor';

export default function TeacherQuestionsPage() {
  return (
    <DashboardShell
      title="Question Management"
      subtitle="Extract questions from documents or create them manually"
      nav={[
        { href: '/dashboard/teacher', label: 'Overview' },
        { href: '/dashboard/teacher/questions', label: 'Questions' },
        { href: '/dashboard/teacher/tests', label: 'Tests' },
      ]}
      actions={<NotificationSystem />}
    >
      <QuestionExtractor />
    </DashboardShell>
  );
}
