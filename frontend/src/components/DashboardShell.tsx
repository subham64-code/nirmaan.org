"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type NavItem = { href: string; label: string };

export default function DashboardShell({
  title,
  subtitle,
  nav,
  children,
  actions,
}: {
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="section">
      <div className="mb-5 rounded-3xl border border-[var(--outline)] bg-[var(--surface)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl">{title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              pathname === item.href
                ? "bg-[var(--brand)] text-white"
                : "border border-[var(--outline)] hover:bg-[var(--surface-2)]"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
