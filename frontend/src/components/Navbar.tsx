"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User, Upload } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { NirmaanLogo } from "./LogoSection";
import { api, authHeader, getMediaUrl } from "@/lib/api";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Employee Course" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/notes", label: "Notes" },
  { href: "/media", label: "Media Gallery" },
  { href: "/apply", label: "Apply" },
];

const dashboardLinks = [
  { href: "/dashboard/admin", label: "Admin Portal", color: "text-red-500" },
  { href: "/dashboard/teacher", label: "Teacher Portal", color: "text-purple-500" },
  { href: "/dashboard/student", label: "Student Portal", color: "text-blue-500" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") : "";

  useEffect(() => {
    const handleUpdate = () => {
      const name = localStorage.getItem("nirmaan_user_name");
      const picture = localStorage.getItem("nirmaan_user_picture");
      const role = localStorage.getItem("nirmaan_role");
      setUserName(name || "User");
      setUserPicture(picture);
      setUserRole(role);
    };

    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("nirmaan_token");
      const name = localStorage.getItem("nirmaan_user_name");
      const picture = localStorage.getItem("nirmaan_user_picture");
      const role = localStorage.getItem("nirmaan_role");
      setIsLoggedIn(!!savedToken);
      setUserName(name || "User");
      setUserPicture(picture);
      setUserRole(role);
      
      if (savedToken) {
        fetchUserProfile(savedToken);
      }

      window.addEventListener("user-profile-updated", handleUpdate);
      return () => {
        window.removeEventListener("user-profile-updated", handleUpdate);
      };
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const profileRoute = userRole === "student" ? "/students/me" : "/auth/me";
      const response = await api.get(profileRoute, { 
        headers: authHeader(authToken) 
      });
      
      if (response.data.data?.profile?.photoUrl || response.data.data?.picture) {
        const photoUrl = response.data.data.profile.photoUrl || response.data.data.picture;
        setUserPicture(photoUrl);
        if (typeof window !== "undefined") {
          localStorage.setItem("nirmaan_user_picture", photoUrl);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsLoadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("role", userRole || "student");

      const response = await api.post("/media/upload-profile", formData, {
        headers: authHeader(token),
      });

      if (response.data.success) {
        setUserPicture(response.data.data.photoUrl);
        if (typeof window !== "undefined") {
          localStorage.setItem("nirmaan_user_picture", response.data.data.photoUrl);
        }
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nirmaan_token");
      localStorage.removeItem("nirmaan_user");
      localStorage.removeItem("nirmaan_user_name");
      localStorage.removeItem("nirmaan_user_picture");
      localStorage.removeItem("nirmaan_role");
      localStorage.removeItem("nirmaan_user_id");
    }
    setIsLoggedIn(false);
    setMenuOpen(false);
    setUserOpen(false);
    router.push("/login/student");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--outline)] bg-[var(--surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <NirmaanLogo />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-[var(--surface-2)] hover:text-[var(--brand)] transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* User Profile Dropdown (if logged in) */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 rounded-full border border-[var(--outline)] px-3 py-2 hover:bg-[var(--surface-2)] transition-colors"
              >
                {userPicture ? (
                  <img
                    src={getMediaUrl(userPicture)}
                    alt={userName}
                    className="w-6 h-6 rounded-full object-cover border border-[var(--outline)]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold hidden sm:inline max-w-[100px] truncate">{userName}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${userOpen ? "rotate-180" : ""}`} />
              </button>
              {userOpen && (
                <div
                  className="absolute right-0 top-10 z-50 min-w-56 rounded-xl border border-[var(--outline)] bg-[var(--surface)] p-2 shadow-xl"
                  onMouseLeave={() => setUserOpen(false)}
                >
                  {/* User Profile Section */}
                  <div className="flex items-center gap-3 px-3 py-3 border-b border-[var(--outline)] mb-2">
                    {userPicture ? (
                      <img
                        src={getMediaUrl(userPicture)}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover border border-[var(--outline)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{userName}</p>
                      {userRole && (
                        <p className="text-xs text-[var(--muted)] capitalize">{userRole}</p>
                      )}
                    </div>
                  </div>

                  {/* Upload Photo */}
                  <label className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--surface-2)] transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{isLoadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isLoadingPhoto}
                      className="hidden"
                    />
                  </label>

                  {/* Profile Link */}
                  <Link
                    href="/dashboard/student"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  {/* Logout */}
                  <div className="mt-2 border-t border-[var(--outline)] pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Role-based Dashboard Button (when logged in) */}
          {isLoggedIn && userRole && (
            <Link
              href={`/dashboard/${userRole}`}
              className="flex items-center gap-1.5 rounded-full border border-[var(--outline)] px-3.5 py-2 text-xs font-bold bg-[var(--surface-2)] text-[var(--brand)] hover:opacity-90 transition-opacity"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          )}

          {!isLoggedIn && (
            <>
              <Link
                href="/login/admin"
                prefetch={false}
                className="rounded-full border border-[var(--outline)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)] transition-colors"
              >
                Admin
              </Link>
              <Link
                href="/login/teacher"
                prefetch={false}
                className="rounded-full border border-[var(--outline)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)] transition-colors"
              >
                Teacher
              </Link>
              <Link
                href="/login/student"
                prefetch={false}
                className="rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Student
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile: hamburger + theme */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-[var(--outline)] p-2 hover:bg-[var(--surface-2)] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-[var(--outline)] bg-[var(--surface)] px-4 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)] hover:text-[var(--brand)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && userRole ? (
              <div className="mt-3 border-t border-[var(--outline)] pt-3 flex flex-col gap-2">
                <p className="px-3 text-xs uppercase tracking-wider text-[var(--muted)]">Dashboard</p>
                <Link
                  key="mobile-dashboard-link"
                  href={`/dashboard/${userRole}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-bold bg-[var(--surface-2)] text-[var(--brand)] transition-colors text-center"
                >
                  Go to {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-red-600 text-white py-2.5 text-xs font-semibold hover:bg-red-700 transition-colors mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-3 border-t border-[var(--outline)] pt-3 flex gap-2">
                <Link href="/login/admin" onClick={() => setMenuOpen(false)} className="flex-1 text-center rounded-full border border-[var(--outline)] py-2 text-xs font-semibold">Admin</Link>
                <Link href="/login/student" onClick={() => setMenuOpen(false)} className="flex-1 text-center rounded-full bg-[var(--brand)] py-2 text-xs font-semibold text-white">Student</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
