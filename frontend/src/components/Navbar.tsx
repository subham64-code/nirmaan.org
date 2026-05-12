"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { NirmaanLogo } from "./LogoSection";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/attendance", label: "Attendance" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/apply", label: "Apply" },
  { href: "/terms", label: "Terms" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--outline)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <NirmaanLogo />
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--brand)] transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login/admin" prefetch={false} className="rounded-full border border-[var(--outline)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)] transition-colors">
            Admin
          </Link>
          <Link href="/login/teacher" prefetch={false} className="rounded-full border border-[var(--outline)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)] transition-colors">
            Teacher
          </Link>
          <Link href="/login/student" prefetch={false} className="rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white">
            Student
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
