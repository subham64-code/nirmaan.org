"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import UserProfileHeader from "./UserProfileHeader";
import { api, authHeader } from "@/lib/api";

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
  const [userRole, setUserRole] = useState<"admin" | "teacher" | "student" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") : "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("nirmaan_role") as "admin" | "teacher" | "student" | null;
      const name = localStorage.getItem("nirmaan_user_name") || "User";
      setUserRole(role);
      setUserName(name);
      
      // Fetch fresh user data if available
      if (token) {
        fetchUserProfile();
      }
    }
  }, [token]);

  useEffect(() => {
    const onProfileUpdated = () => fetchUserProfile();
    if (typeof window !== "undefined") {
      window.addEventListener("user-profile-updated", onProfileUpdated);
      return () => window.removeEventListener("user-profile-updated", onProfileUpdated);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profileRoute = userRole === "student" ? "/students/me" : "/auth/me";
      const response = await api.get(profileRoute, { 
        headers: authHeader(token) 
      });
      
      if (response.data.data?.profile) {
        const profile = response.data.data.profile;
        if (typeof window !== "undefined") {
          if (profile.name) {
            localStorage.setItem("nirmaan_user_name", profile.name);
            setUserName(profile.name);
          }
          const photoUrl = profile.photoUrl || response.data.data.picture;
          if (photoUrl) {
            localStorage.setItem("nirmaan_user_picture", photoUrl);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handlePhotoUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="section">
      <div className="mb-5 rounded-3xl border border-[var(--outline)] bg-[var(--surface)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl md:text-5xl">{title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {actions && <div className="flex items-center gap-2">{actions}</div>}
            <UserProfileHeader 
              userName={userName} 
              userRole={userRole}
              refreshTrigger={refreshKey}
            />
          </div>
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
