import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="section">
      <article className="glass p-8" data-reveal>
        <h1 className="text-4xl md:text-6xl">Terms & Conditions</h1>
        <div className="mt-6 space-y-4 text-sm text-[var(--muted)]">
          <p><strong>Student Responsibilities:</strong> Attend classes regularly, submit assignments on time, and follow faculty guidance.</p>
          <p><strong>Attendance:</strong> Minimum 75% attendance is mandatory for certification and placement eligibility.</p>
          <p><strong>Code of Conduct:</strong> Respect trainers and peers. Any harassment or misconduct can lead to suspension.</p>
          <p><strong>Exam Rules:</strong> Online tests are time-bound and auto-submitted at timer completion.</p>
          <p><strong>Certification:</strong> Certificate is issued after successful completion of attendance, assessments, and final evaluation.</p>
        </div>
        <Link href="/apply" className="mt-6 inline-block rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white">Proceed to Apply</Link>
      </article>
    </div>
  );
}
