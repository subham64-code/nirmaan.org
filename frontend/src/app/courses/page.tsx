import { courses } from "@/lib/constants";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <div className="section">
      <h1 data-reveal className="text-4xl md:text-6xl">Courses</h1>
      <p data-reveal className="mt-3 text-[var(--muted)]">Industry-oriented learning paths with structured assessments and placement preparation.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <article key={course.title} data-reveal className="glass p-6">
            <h2 className="text-2xl">{course.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{course.description}</p>
            <p className="mt-3 text-sm"><span className="font-semibold">Duration:</span> {course.duration}</p>
            <p className="mt-3 text-sm font-semibold">Skills:</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-[var(--muted)]">
              {course.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm"><span className="font-semibold">Placement:</span> {course.placement}</p>
            <div className="mt-6 flex gap-3">
              <Link href="/syllabus" className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                View Syllabus
              </Link>
              <Link href="/apply" className="rounded-full border border-blue-600 px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors">
                Apply Now
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section data-reveal className="glass mt-10 p-6">
        <h2 className="text-2xl">Google Sheet Integration</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Replace the link below with your live syllabus or course coverage sheet URL.</p>
        <iframe title="Course Curriculum - Google Sheets" className="mt-4 h-[420px] w-full rounded-xl border border-[var(--outline)]" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vT4vA4M8/demo/pubhtml?widget=true&amp;headers=false" />
      </section>
    </div>
  );
}
