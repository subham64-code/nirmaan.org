import { dailyAttendanceReportUrl } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--outline)] bg-[var(--surface)] px-4 py-8 text-sm md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-[var(--muted)]">Nirmaan x GIFT collaborative learning platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a className="rounded-full border border-[var(--outline)] px-3 py-1 hover:bg-[var(--surface-2)]" href="https://instagram.com/my_self_subham_67" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="rounded-full border border-[var(--outline)] px-3 py-1 hover:bg-[var(--surface-2)]" href="https://linkedin.com/in/subham-behera" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="rounded-full border border-[var(--outline)] px-3 py-1 hover:bg-[var(--surface-2)]" href="https://youtu.be/9bZkp7q19f0" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a className="rounded-full border border-[var(--outline)] px-3 py-1 hover:bg-[var(--surface-2)]" href={dailyAttendanceReportUrl} target="_blank" rel="noopener noreferrer">Attendance Report</a>
        </div>
      </div>
    </footer>
  );
}
