"use client";

import { useState, useEffect } from "react";
import { api, getMediaUrl } from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Phone, Briefcase, Calendar, AlertCircle } from "lucide-react";

interface Faculty {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  designation: string;
  photo?: string;
  bio?: string;
  department?: string;
  joinDate: string;
  isActive: boolean;
}

interface TeacherProfileCardProps {
  teacherName: string;
  compact?: boolean;
}

export default function TeacherProfileCard({ teacherName, compact = false }: TeacherProfileCardProps) {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("nirmaan_token") : "";

  useEffect(() => {
    // Check if user has a stored profile picture from OAuth
    if (typeof window !== "undefined") {
      const picture = localStorage.getItem("nirmaan_user_picture");
      if (picture) {
        setUserPicture(picture);
      }
    }
    fetchTeacherProfile();
  }, [teacherName, token]);

  const fetchTeacherProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/faculty/name/${encodeURIComponent(teacherName)}`);
      
      if (response.data.success) {
        const facultyData = response.data.data;
        setFaculty(facultyData);
        
        // Use faculty photo if available, otherwise use stored user picture
        if (facultyData.photo) {
          setUserPicture(facultyData.photo);
        }
      } else {
        setError("Teacher profile not found");
      }
    } catch (err) {
      console.error("Error fetching teacher profile:", err);
      setError("Failed to load teacher profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-4"
      >
        <div className="animate-pulse text-gray-500">Loading profile...</div>
      </motion.div>
    );
  }

  if (error || !faculty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100"
      >
        <AlertCircle size={18} />
        <span className="text-sm">{error || "Profile not available"}</span>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-blue-200 dark:border-slate-700"
      >
        {(userPicture || faculty?.photo) && (
          <img
            src={getMediaUrl(userPicture || faculty!.photo)}
            alt={faculty?.name || teacherName}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 dark:border-blue-700"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty?.name}`;
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{faculty?.name || teacherName}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{faculty?.designation || "Faculty"}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-4"
    >
      {/* Header with photo */}
      <div className="flex items-start gap-4">
        {(userPicture || faculty?.photo) && (
          <img
            src={getMediaUrl(userPicture || faculty!.photo)}
            alt={faculty?.name || teacherName}
            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--brand)]"
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty?.name}`;
            }}
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold">{faculty?.name || teacherName}</h3>
          <p className="text-sm text-[var(--muted)] capitalize">{faculty?.designation}</p>
          {faculty?.department && (
            <p className="text-xs text-[var(--muted)] mt-1">Department: {faculty.department}</p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 pt-4 border-t border-[var(--outline)]">
        {faculty?.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-[var(--brand)]" />
            <a href={`mailto:${faculty.email}`} className="text-blue-600 hover:underline">
              {faculty.email}
            </a>
          </div>
        )}
        {faculty?.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-[var(--brand)] flex-shrink-0" />
            <a href={`tel:${faculty.phone}`} className="text-blue-600 hover:underline">
              {faculty.phone}
            </a>
          </div>
        )}
        {faculty?.joinDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-[var(--brand)]" />
            <span>Joined: {new Date(faculty.joinDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {faculty?.bio && (
        <div className="pt-4 border-t border-[var(--outline)]">
          <p className="text-sm text-[var(--muted)] leading-relaxed">{faculty.bio}</p>
        </div>
      )}
    </motion.div>
  );
}
