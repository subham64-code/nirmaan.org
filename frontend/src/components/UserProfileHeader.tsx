"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { api, authHeader, getMediaUrl } from "@/lib/api";

interface UserProfileHeaderProps {
  userName?: string;
  userRole?: "admin" | "teacher" | "student";
  refreshTrigger?: number;
}

export default function UserProfileHeader({ userName, userRole, refreshTrigger }: UserProfileHeaderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") || "" : "";

  useEffect(() => {
    const handleUpdate = () => {
      setDisplayName(localStorage.getItem("nirmaan_user_name") || "User");
      const cachedPicture = localStorage.getItem("nirmaan_user_picture");
      setUserPicture(cachedPicture);
    };

    if (typeof window !== "undefined") {
      setDisplayName(userName || localStorage.getItem("nirmaan_user_name") || "User");
      fetchUserProfile();
      window.addEventListener("user-profile-updated", handleUpdate);
      return () => {
        window.removeEventListener("user-profile-updated", handleUpdate);
      };
    }
  }, [userName, refreshTrigger]);

  const fetchUserProfile = async () => {
    try {
      if (!token) return;
      
      const profileRoute = userRole === "student" ? "/students/me" : "/auth/me";
      const response = await api.get(profileRoute, { 
        headers: authHeader(token) 
      });
      
      if (response.data.data?.profile) {
        const profile = response.data.data.profile;
        if (profile.name) {
          setDisplayName(profile.name);
          if (typeof window !== "undefined") {
            localStorage.setItem("nirmaan_user_name", profile.name);
          }
        }
        const photoUrl = profile.photoUrl || response.data.data.picture;
        if (photoUrl) {
          setUserPicture(photoUrl);
          if (typeof window !== "undefined") {
            localStorage.setItem("nirmaan_user_picture", photoUrl);
          }
        }
      } else if (typeof window !== "undefined") {
        const cachedPicture = localStorage.getItem("nirmaan_user_picture");
        setUserPicture(cachedPicture);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      if (typeof window !== "undefined") {
        const cachedPicture = localStorage.getItem("nirmaan_user_picture");
        setUserPicture(cachedPicture);
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
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
          window.dispatchEvent(new Event("user-profile-updated"));
        }
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all localStorage items related to authentication
    if (typeof window !== "undefined") {
      localStorage.removeItem("nirmaan_token");
      localStorage.removeItem("nirmaan_user");
      localStorage.removeItem("nirmaan_user_name");
      localStorage.removeItem("nirmaan_user_picture");
      localStorage.removeItem("nirmaan_role");
      localStorage.removeItem("nirmaan_user_id");
    }
    
    // Redirect to login
    router.push("/login/student");
  };

  const roleColors = {
    admin: "bg-red-100 text-red-700",
    teacher: "bg-purple-100 text-purple-700",
    student: "bg-blue-100 text-blue-700",
  };

  const roleBadgeColor = userRole ? roleColors[userRole] : "bg-gray-100 text-gray-700";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-[var(--outline)] px-3 py-2 hover:bg-[var(--surface-2)] transition-colors group"
      >
        {userPicture ? (
          <img
            src={getMediaUrl(userPicture)}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-[var(--outline)] group-hover:border-[var(--brand)] transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold">{displayName}</p>
          {userRole && (
            <p className="text-xs text-[var(--muted)] capitalize">{userRole}</p>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 min-w-56 rounded-xl border border-[var(--outline)] bg-[var(--surface)] shadow-xl p-2">
          {/* User Info */}
          <div className="px-3 py-2 border-b border-[var(--outline)] mb-2">
            <div className="flex items-center gap-3">
              {userPicture ? (
                <img
                  src={getMediaUrl(userPicture)}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover border border-[var(--outline)]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                {userRole && (
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${roleBadgeColor}`}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Photo */}
          <label className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--surface-2)] transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isLoading}
              className="hidden"
            />
          </label>

          {/* Menu Items */}
          <Link
            href="/dashboard/student"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--surface-2)] transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            href="/dashboard/student"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--surface-2)] transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          {/* Divider */}
          <div className="my-2 border-t border-[var(--outline)]" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
